import os
import time

from pyquery import PyQuery
import typer
from rich.console import Console
from rich.prompt import Confirm
import shubhlipi as sh

app = typer.Typer()
console = Console()

OUTPUT_DATA_FOLDER = "data"
RAW_DATA_FOLDER = "raw_data"


def get_shloka_json(path: str):
    """extract the shlokas from html and save them into json"""

    text = sh.read(path)
    html = PyQuery(text)
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
        # also check here #mw-content-text > div.mw-content-ltr.mw-parser-output > p:nth-child(7)
        prev = line
        # Break the shloka line flow also if end if pUrNa virAma ॥
        if len(line) > 0 and line[-1] == "॥":
            prev = ""
    out_folder = f"{path.replace(RAW_DATA_FOLDER, OUTPUT_DATA_FOLDER)[:-5]}.json"
    sh.write(out_folder, sh.dump_json(shloka_list, 2))


@app.command()
def main(
    no_confirm: bool = typer.Option(True, "--no-confirm", "-y"),
):
    if not os.path.isdir(RAW_DATA_FOLDER):
        console.print("[bold red]Raw Data folder not found![/]")
        exit(-1)
    # Checking if raw data already exists
    if os.path.isdir(OUTPUT_DATA_FOLDER):
        if not no_confirm:
            choice = Confirm.ask(
                "[yellow]Raw Data already exists, do you want to recreate it ?[/]"
            )
            if not choice:
                return
        sh.delete_folder(OUTPUT_DATA_FOLDER)
        sh.makedir(OUTPUT_DATA_FOLDER)
    else:
        sh.makedir(OUTPUT_DATA_FOLDER)
    [
        sh.makedir(f"{OUTPUT_DATA_FOLDER}/{kANDa_name}")
        for kANDa_name in os.listdir(RAW_DATA_FOLDER)
    ]

    start_time = time.time()
    for root, _, files in os.walk(RAW_DATA_FOLDER):
        for file in files:
            path = os.path.join(root, file)
            get_shloka_json(path)
    end_time = time.time()
    console.print(f"[white bold]Time: {round(end_time-start_time)}s[/]")


if __name__ == "__main__":
    app()
