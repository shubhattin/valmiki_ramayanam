#!/usr/bin/env python3

import os
import time

from pyquery import PyQuery
import typer
from rich.console import Console
from rich.prompt import Confirm, Prompt
import shubhlipi as sh
from common import DOUBLE_VIRAMA, SINGLE_VIRAMA


app = typer.Typer()
console = Console()

OUTPUT_TEXT_FOLDER = "text_data"
RAW_DATA_FOLDER = "raw_data"


def get_shloka_text(
    kANDa_num: str, sarga_num: str, to_recreate_text_folder=False, path: str = ""
):
    """extract the shlokas from html and save them into text"""

    shlokAni: str = ""
    if not to_recreate_text_folder:
        # not recreating the text data, rather reiterating over it
        shlokAni = sh.read(f"{OUTPUT_TEXT_FOLDER}/{kANDa_num}/{sarga_num}.txt")
    else:
        text = sh.read(path)
        html = PyQuery(text)

        shloka_extractor = html(
            "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem > p"
        )

        if shloka_extractor:
            # 1st structure
            shlokAni = str(shloka_extractor.text())
        else:
            # 2nd structure
            # some pages have different strucure, the first noticed was 3-4
            shloka_extractor = html(
                "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.verse > pre"
            )
            if shloka_extractor:
                shlokAni = str(
                    shloka_extractor.html()
                )  # html as it is contained in a pre tag
            else:
                # 3rd structure
                # some sites have this structure, first found in 2-86
                prev_elmnt = html(
                    "#mw-content-text > div.mw-content-ltr.mw-parser-output > figure"
                )
                while True:
                    next_p = prev_elmnt.next("p")
                    is_p_tag = next_p.is_("p")
                    if not is_p_tag:
                        # according to structure the series is broken by a div which occurs here
                        break
                    shlokAni += next_p.text()
                    prev_elmnt = next_p

    def normalize_line(line):
        line = line.strip()  # stripping the leading and trailing spaces
        replaces = {
            "<b>": "",
            "</b>": "",
            "'''": "",
            f"{SINGLE_VIRAMA}{SINGLE_VIRAMA}{SINGLE_VIRAMA}": DOUBLE_VIRAMA,
            f"{SINGLE_VIRAMA}{SINGLE_VIRAMA}": DOUBLE_VIRAMA,
            f"{SINGLE_VIRAMA}{DOUBLE_VIRAMA}": DOUBLE_VIRAMA,  # first found in 1-2-27
        }
        for k, v in replaces.items():
            line = line.replace(k, v)
        return line

    # Some filtering and preprocessing for text files
    new_lines = []
    for line in shlokAni.split("\n"):
        line = normalize_line(line)
        END_TEXTS = ("इत्यार्षे श्रीमद्रामायणे वाल्मीकीये", "इति वाल्मीकि रामायणे आदि काव्ये")
        NOT_STARTS_WITH = [
            "$",
            "%",
            "&",
            "(",
            "<",
            ">",
            "श्रीमद्वाल्मीकियरामायणे",
            "श्रीमद्वाल्मीकीयरामायणे",
        ]
        NOT_STARTS_WITH.extend(END_TEXTS)
        continue_status = False
        break_loop_as_last_found = False
        for nsw in NOT_STARTS_WITH:
            if line.startswith(nsw):
                for end_text in END_TEXTS:
                    if line.startswith(end_text):
                        break_loop_as_last_found = True
                continue_status = True
                break
        if break_loop_as_last_found:
            break
        elif continue_status:
            continue
        new_lines.append(line)
    shlokAni = "\n".join(new_lines)

    out_folder = f"{OUTPUT_TEXT_FOLDER}/{kANDa_num}/{sarga_num}.txt"
    sh.write(out_folder, shlokAni)


@app.command()
def main():
    if not os.path.isdir(RAW_DATA_FOLDER):
        console.print("[bold red]Raw Data folder not found![/]")
        exit(-1)
    choices = ["1", "2"]
    console.print(
        "[blue]1. Use the existing text data to make programatic adjustments[/]"
    )
    console.print(
        "[blue]2. Get the text data from raw data [red bold](Not Recommended)[/][/]"
    )
    choice = Prompt.ask("Choose an option", choices=choices, default="1")
    if choice == "2":
        if os.path.isdir(OUTPUT_TEXT_FOLDER):
            choice_text_recreate = Confirm.ask(
                "[yellow]Text Data already exists, do you want to recreate it, [red bold](Not Recommended)[/] ?[/]"
            )
            if not choice_text_recreate:
                return
            sh.delete_folder(OUTPUT_TEXT_FOLDER)
            sh.makedir(OUTPUT_TEXT_FOLDER)
        else:
            sh.makedir(OUTPUT_TEXT_FOLDER)
        for kANDa_name in os.listdir(RAW_DATA_FOLDER):
            # Only taking the number to create json folder
            sh.makedir(f"{OUTPUT_TEXT_FOLDER}/{kANDa_name.split(".")[0]}")

    if choice == "1" and not os.path.isdir(OUTPUT_TEXT_FOLDER):
        console.print("[bold red]Text Data folder not found![/]")
        exit(-1)

    start_time = time.time()
    for root, _, files in os.walk(RAW_DATA_FOLDER):
        for file in files:
            path = os.path.join(root, file)
            kANDa_num = path.split("/")[-2].split(".")[0]
            sarga_num = path.split("/")[-1].split("_")[-1].split(".")[0]
            get_shloka_text(kANDa_num, sarga_num, choice == "2", path)
    end_time = time.time()
    console.print(f"[white bold]Time: {round(end_time-start_time)}s[/]")


if __name__ == "__main__":
    app()
