import os
from concurrent.futures import ThreadPoolExecutor
from functools import reduce

import typer
from rich.console import Console
from rich.prompt import Confirm
from pyquery import PyQuery
import requests
import shubhlipi as sh

app = typer.Typer()
console = Console()

HOST_URL = "https://sa.wikisource.org"
URL = f"{HOST_URL}/wiki/%E0%A4%B5%E0%A4%BE%E0%A4%B2%E0%A5%8D%E0%A4%AE%E0%A5%80%E0%A4%95%E0%A4%BF%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%AF%E0%A4%A3%E0%A4%AE%E0%A5%8D"
USER_AGENT_HEADER = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
RAW_DATA_FOLDER = "raw_data"
OUTPUT_FOLDER = "out"


@app.command()
def main(
    url: str = None,
    no_confirm: bool = typer.Option(True, "--no-confirm", "-y"),
):
    """App to Scrap data from website"""

    # Checking if raw data already exists
    if not no_confirm and os.path.isdir("raw_data"):
        choice = Confirm.ask(
            "[blue]Raw Data already exists, do you want to recreate it ?[/]", end=""
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
    for kANDa in kANDa_ref.items():
        kANDa_name = kANDa.text()
        kANDa_link = kANDa("a").attr("href")
        if kANDa_link[0] == "/":
            kANDa_link = HOST_URL + kANDa_link
        kANDa_list.append([kANDa_name, kANDa_link])
    console.print(f"Number of kANDa found : {len(kANDa_list)}")

    # Getting sarga info(link) of each kANDa
    def get_sarga_links_list(kANDa_link: str, kANDa_index):
        req = requests.get(kANDa_link, headers=USER_AGENT_HEADER, timeout=5)
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

    sarga_info_per_kanda: list[list[str]] = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        for i, kANDa in enumerate(kANDa_list):
            sarga_info_per_kanda.append([])
            executor.submit(
                lambda: get_sarga_links_list(kANDa[1], i)
            )  # passing link to get_sarga_links_list
    console.print(
        f"[bold]Total sarga found : {reduce(lambda prev, lst: prev + len(lst), sarga_info_per_kanda, 0)}[/]"
    )

    # Getting each sarga
    def get_sarga_info(sarga_link: str, kANDa_index, sarga_index):
        req = requests.get(sarga_link, headers=USER_AGENT_HEADER, timeout=5)
        if not req.ok:
            console.print(
                f"[red bold]Not able to access sarga no. {kANDa_index}-{sarga_index}[/]"
            )

        html = PyQuery(req.text)
        # work left to done
        shlokAni = str(
            html(
                "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem > p"
            ).text()
        ).splitlines()[2:]
        console.print(shlokAni)
        console.print("Total Lines of Shlok : ", len(shlokAni))

    get_sarga_info(sarga_info_per_kanda[0][1], 0, 0)


if __name__ == "__main__":
    app()
