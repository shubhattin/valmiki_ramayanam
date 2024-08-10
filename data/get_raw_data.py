import os
from concurrent.futures import ThreadPoolExecutor
from functools import reduce
import urllib.parse
import time

import typer
from rich.console import Console
from rich.prompt import Confirm
from pyquery import PyQuery
import requests
import shubhlipi as sh

app = typer.Typer()
console = Console()

HOST_URL = "https://sa.wikisource.org"
URL = f"{HOST_URL}/wiki/रामायणम्"
USER_AGENT_HEADER = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
OUT_DATA_FOLDER = "data"


@app.command()
def main(
    url: str = None,
    no_confirm: bool = typer.Option(True, "--no-confirm", "-y"),
):
    """App to Scrap data from website"""

    # Checking if raw data already exists
    if os.path.isdir(OUT_DATA_FOLDER):
        if not no_confirm:
            choice = Confirm.ask(
                "[blue]Raw Data already exists, do you want to recreate it ?[/]", end=""
            )
            if not choice:
                return
        sh.delete_folder(OUT_DATA_FOLDER)
        sh.makedir(OUT_DATA_FOLDER)
    else:
        sh.makedir(OUT_DATA_FOLDER)
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
        sh.makedir(f"{OUT_DATA_FOLDER}/{i}. {kANDa_name}")
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
            # # we will not scaping data from the url from the editbale page url
            # sarga_link = sarga_link.replace("wiki/", "")
            # sarga_link = f"/w/index.php?title={sarga_link}&action=edit"
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
        ).splitlines()
        shloka_list = []
        prev = None
        for line in shlokAni:
            line = line.strip()  # stripping the leading and trailing spaces
            line = line.replace("  ", " ").replace(
                "   ", ""
            )  # replace double and triple space with single
            if line != "":
                if prev == None or prev == "":  # new shloka start
                    shloka_list.append(line)
                elif prev != "":
                    shloka_list[-1] = shloka_list[-1] + "\n" + line
            prev = line
            # Break the shloka line flow also if end if pUrNa virAma ॥
            if len(line) > 0 and line[-1] == "॥":
                prev = ""
        out_folder = (
            f"{OUT_DATA_FOLDER}/{kANDa_index + 1}. {kANDa_list[kANDa_index][0]}"
        )
        sh.write(f"{out_folder}/{sarga_index + 1}.json", sh.dump_json(shloka_list, 2))

    start_time = time.time()
    with ThreadPoolExecutor(max_workers=200) as executor:
        for kANDa_index in range(len(kANDa_list)):
            if kANDa_index != 0:  # only processing bala kANDa
                continue
            for i, sarga_link in enumerate(sarga_info_per_kanda[kANDa_index]):
                executor.submit(lambda: get_sarga_info(sarga_link, kANDa_index, i))
    end_time = time.time()
    console.print(f"[bold]Time Taken: {round(end_time-start_time,1)}s[/]")


if __name__ == "__main__":
    app()
