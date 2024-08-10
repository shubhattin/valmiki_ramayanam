import os
import re
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


def to_dev_numbers(text: str):
    for i, num in enumerate(NUMBERS):
        text = text.replace(str(i), num)
    return text


def get_shloka_json(path: str):
    """extract the shlokas from html and save them into json"""

    text = sh.read(path)
    html = PyQuery(text)
    shlokAni = str(
        html(
            "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem > p"
        ).text()
    ).splitlines()
    shloka_list: list[str] = []
    # these nums are in normal formaat
    kANDa_num = path.split("/")[-2].split(".")[0]
    sarga_num = path.split("/")[-1].split("_")[-1].split(".")[0]

    def normalize_line(line):
        line = line.strip()  # stripping the leading and trailing spaces
        line = line.replace("  ", " ").replace(
            "   ", ""
        )  # replace double and triple space with single
        return line

    prev = None
    for line in shlokAni:
        line = normalize_line(line)
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

    normalized_shloka_list = []
    for i in range(len(shloka_list)):
        line = shloka_list[i]
        # normalizing to ॥१-४४-१॥ format
        if len(line.split("॥")) == 3:  # ॥<text>॥ found
            # stripping the info text in between ॥ before processing
            line_split = line.split("॥")
            line = "॥".join([line_split[0], line_split[1].strip(), line_split[2]])
            if i == 0 or i == len(shloka_list) - 1:  # ignore for 1st and last
                normalized_shloka_list.append(line)
                continue
            match = re.findall(r"॥\d+-\d+-\d+॥", line)
            if not match:
                line_split = line.split("॥")
                shloka_num = line_split[1]
                line = "॥".join(
                    [
                        line_split[0],
                        to_dev_numbers(f"{kANDa_num}-{sarga_num}-{shloka_num}"),
                        line_split[2],
                    ]
                )
        normalized_shloka_list.append(line)
    shloka_list = normalized_shloka_list

    # Adding Space before pUrNa virAma ॥ and ।
    spaced_shloka_list = []
    for i in range(len(shloka_list)):
        lines = shloka_list[i].splitlines()
        new_lines = []
        for line in lines:
            if "॥" in line or "।" in line:
                ind = line.index("॥") if "॥" in line else line.index("।")
                # adding space before virAma
                if line[ind - 1] != " ":
                    line = line[:ind] + " " + line[ind:]
            new_lines.append(line)
        line = "\n".join(new_lines)
        spaced_shloka_list.append(line)
    shloka_list = spaced_shloka_list

    possible_last_line = html(
        "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem + p"
    )  # the ending line gets missed because of some inconsitency
    out_folder = f"{path.replace(RAW_DATA_FOLDER, OUTPUT_DATA_FOLDER)[:-5]}.json"
    if possible_last_line:
        shloka_list.append(normalize_line(possible_last_line.text()))
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
