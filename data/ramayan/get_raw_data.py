import os
from concurrent.futures import ThreadPoolExecutor
from functools import reduce
import urllib.parse
import time
from typing import Callable

import typer
from rich.console import Console
from rich.prompt import Confirm
from pyquery import PyQuery
import requests
import shubhlipi as sh
from rich.progress import Progress, SpinnerColumn, BarColumn

app = typer.Typer()
console = Console()

HOST_URL = "https://sa.wikisource.org"
URL = f"{HOST_URL}/wiki/रामायणम्"
USER_AGENT_HEADER = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
RAW_DATA_FOLDER = "raw_data"
DATA_OUTPUT_FOLDER = "data"
NUMBERS = [
    "०",
    "१",
    "२",
    "३",
    "४",
    "५",
    "६",
    "७",
    "८",
    "९",
]

def from_dev_numbers(text: str):
    for i, num in enumerate(NUMBERS):
        text = text.replace(num, str(i))
    return text

@app.command()
def main(
    url: str = None,
    no_confirm: bool = typer.Option(False, "--no-confirm", "-y"),
):
    """App to Scrap data from website"""

    # Checking if raw data already exists
    if os.path.isdir(RAW_DATA_FOLDER):
        if not no_confirm:
            choice = Confirm.ask(
                "[yellow]Raw Data already exists, do you want to recreate it ?[/]"
            )
            if not choice:
                return
        sh.delete_folder(RAW_DATA_FOLDER)
        sh.makedir(RAW_DATA_FOLDER)
    else:
        sh.makedir(RAW_DATA_FOLDER)
    scraping_url = URL if not url else url
    req = requests.get(scraping_url, headers=USER_AGENT_HEADER, timeout=5)
    if not req.ok:
        console.print("[red bold]failed to fetch URL[/]")

    # Getting kANDa list -> name and link
    html = PyQuery(req.text)
    kANDa_ref = html("#mw-content-text > div.mw-content-ltr.mw-parser-output > ol li")
    kANDa_list: list[list[str]] = []  # name, link
    i = 1
    for kANDa in kANDa_ref.items():
        kANDa_name = kANDa.text()
        sh.makedir(f"{RAW_DATA_FOLDER}/{i}. {kANDa_name}")
        kANDa_link = str(kANDa("a").attr("href"))
        if kANDa_link[0] == "/":
            kANDa_link = HOST_URL + kANDa_link
        kANDa_list.append([kANDa_name, kANDa_link])
        i += 1
    console.print(f"Number of kANDa found : {len(kANDa_list)}")

    # Getting sarga info(link) of each kANDa
    def get_sarga_links_list(sarga_link: str, kANDa_index):
        req = requests.get(sarga_link, headers=USER_AGENT_HEADER, timeout=5)
        if not req.ok:
            console.print(f"[red bold]Not able to access kANDa no. {kANDa_index}[/]")

        html = PyQuery(req.text)
        sarga_list = html(
            "#mw-content-text > div.mw-content-ltr.mw-parser-output > table:nth-child(4) > tbody > tr li"
        )
        for sarga in sarga_list.items():
            sarga_link = sarga("a").attr("href")
            if sarga_link[0] == "/":
                sarga_link = HOST_URL + sarga_link
            sarga_info_per_kanda[kANDa_index].append(sarga_link)
        # in bAlakANDa remove the last saMpUrNam
        if kANDa_index == 0:
            name = urllib.parse.unquote(
                sarga_info_per_kanda[0][-1].split("/")[-1].split("&")[0]
            )
            if name == "सम्पूर्णम्":
                sarga_info_per_kanda[0].pop()

    sarga_info_per_kanda: list[list[str]] = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        for i, kANDa in enumerate(kANDa_list):
            sarga_info_per_kanda.append([])
            executor.submit(
                get_sarga_links_list, kANDa[1], i
            )  # passing link to get_sarga_links_list
    TOTAL_SARGA = reduce(lambda prev, lst: prev + len(lst), sarga_info_per_kanda, 0)
    console.print(f"[bold]Total sarga found : {TOTAL_SARGA}[/]")

    # Getting each sarga
    FAILED_SARGA: list[list[int]] = []

    def get_sarga_info(
        sarga_link: str,
        kANDa_index: int,
        update_func: Callable[[], None],
    ):
        req = requests.get(sarga_link, headers=USER_AGENT_HEADER, timeout=5)
        if not req.ok:
            FAILED_SARGA.append([kANDa_index + 1, sarga_numb + 1])
            update_func()
            return
        out_folder = (
            f"{RAW_DATA_FOLDER}/{kANDa_index + 1}. {kANDa_list[kANDa_index][0]}"
        )
        sarga_numb = urllib.parse.unquote(sarga_link.split("/")[-1].split("_")[-1])
        sarga_numb=from_dev_numbers(sarga_numb)
        sh.write(f"{out_folder}/{sarga_numb}.html", req.text)
        update_func()

    start_time = time.time()
    with Progress(
        SpinnerColumn("dots"),
        "[progress.description]{task.description}",
        BarColumn(),
        "[progress.percentage]{task.completed}/{task.total}",
    ) as progress:
        task_progress = progress.add_task(
            "[cyan]Extracting Sargas...",
            total=TOTAL_SARGA,
        )

        def update_progess_by_one_sarga():
            progress.update(task_progress, advance=1)

        with ThreadPoolExecutor(max_workers=300) as executor:
            for kANDa_index in range(len(kANDa_list)):
                for sarga_link in sarga_info_per_kanda[kANDa_index]:
                    executor.submit(
                        get_sarga_info,
                        sarga_link,
                        kANDa_index,
                        update_progess_by_one_sarga,
                    )
        progress.update(task_progress, completed=TOTAL_SARGA)
    end_time = time.time()
    console.print(f"[bold]Time Taken: {round(end_time-start_time,1)}s[/]")

    if len(FAILED_SARGA) > 0:
        console.print(
            f"[red]Failed kANDa-sargas : {", ".join(list(map(lambda item:f"{item[0]}-{item[1]}", FAILED_SARGA)))}[/]"
        )

    # Compress the raw data
    if os.path.isfile("zipped/raw_data.7z"):
        os.remove("zipped/raw_data.7z") 
    elif not os.path.isdir("zipped"):
        sh.makedir("zipped")
    sh.cmd("cd raw_data && 7z a -t7z -mx=9 ../zipped/raw_data.7z *", display=False)

if __name__ == "__main__":
    app()