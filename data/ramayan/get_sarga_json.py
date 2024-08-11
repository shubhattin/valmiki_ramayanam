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
SINGLE_VIRAMA = "।"
DOUBLE_VIRAMA = "॥"


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
    # these nums are in normal formaat
    kANDa_num = path.split("/")[-2].split(".")[0]
    sarga_num = path.split("/")[-1].split("_")[-1].split(".")[0]

    shloka_extractor = html(
        "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem > p"
    )
    shlokAni: list[str] = []

    def normalize_line(line):
        line = line.strip()  # stripping the leading and trailing spaces
        line = line.replace("   ", " ").replace(
            "  ", ""
        )  # replace double and triple space with single
        return line

    if shloka_extractor:
        # 1st structure
        shlokAni = str(shloka_extractor.text()).splitlines()
        SPECIAL_CASES = [  # special cases detected only after testing
            ["7", "25"],
            ["7", "101"],
            ["7", "16"],
        ]
        for spl in SPECIAL_CASES:
            if kANDa_num == spl[0] and sarga_num == spl[1]:
                # 4th case
                # we have add a blank line after every shloka ending so that they are merged into one line
                spaced_shlokAni = []
                for line in shlokAni:
                    line = normalize_line(line)
                    line = line.replace(
                        f"{SINGLE_VIRAMA}{SINGLE_VIRAMA}", DOUBLE_VIRAMA
                    )
                    spaced_shlokAni.append(line)
                    if line[-1] == DOUBLE_VIRAMA:
                        spaced_shlokAni.append("")
                shlokAni = spaced_shlokAni

    else:
        # 2nd structure
        # some pages have different strucure, the first noticed was 3-4
        shloka_extractor = html(
            "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.verse > pre"
        )
        if shloka_extractor:
            shlokAni = [
                html(
                    "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.verse"
                )
                .prev("p")
                .text(),
                "",  # leaving blank to seperate it
            ]
            shlokAni.extend(
                str(shloka_extractor.html()).splitlines()
            )  # html as it is contained in a pre tag
        else:
            # 3rd structure
            # some sites have this structure, first found in 2-86
            prev_elmnt = html(
                "#mw-content-text > div.mw-content-ltr.mw-parser-output > figure"
            )
            atleast_one_p_tag = False
            while True:
                next_p = prev_elmnt.next("p")
                is_p_tag = next_p.is_("p")
                if not is_p_tag:
                    # according to structure the series is broken by a div which occurs here
                    break
                atleast_one_p_tag = True
                shlokAni.extend([next_p.text(), ""])
                prev_elmnt = next_p

    # console.print(f"{kANDa_num}-{sarga_num}")

    shloka_list: list[str] = []

    prev = None
    prev_line_not_ended = False
    for line in shlokAni:
        line = normalize_line(line)
        if line != "":
            if prev == None or prev == "":  # new shloka start
                shloka_list.append(line)
            elif prev != "":
                if prev_line_not_ended:
                    if prev[-1] == "-":
                        shloka_list[-1] = (
                            shloka_list[-1][:-1] + line
                        )  # till -1 else - will also be included
                    else:
                        shloka_list[-1] = shloka_list[-1] + " " + line
                    prev_line_not_ended = False
                else:
                    shloka_list[-1] = shloka_list[-1] + "\n" + line
        # Break the shloka line flow also if end if pUrNa virAma ॥
        if len(line) > 0 and line[-1] not in (SINGLE_VIRAMA, DOUBLE_VIRAMA):
            prev_line_not_ended = True
        prev = line

        if len(line) > 0 and line[-1] == DOUBLE_VIRAMA:
            prev = ""

    possible_last_line = html(
        "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem + p"
    )  # the ending line gets missed because of some inconsitency
    if not possible_last_line:
        possible_last_line = html(
            "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.verse + p"
        )  # different structure, first found in 3-4
    if possible_last_line:
        shloka_list.append(normalize_line(possible_last_line.text()))

    # Normalizing to ॥१-४४-१॥ format
    # originally this problem found from 1-45 onwards
    normalized_shloka_list = []
    for i in range(len(shloka_list)):
        line = shloka_list[i]
        if len(line.split(DOUBLE_VIRAMA)) == 3:  # ॥<text>॥ found
            # stripping the info text in between ॥ before processing
            line_split = line.split(DOUBLE_VIRAMA)
            line = DOUBLE_VIRAMA.join(
                [line_split[0], line_split[1].strip(), line_split[2]]
            )
            if i == 0 or i == len(shloka_list) - 1:  # ignore for 1st and last
                normalized_shloka_list.append(line)
                continue
            match = re.findall(r"॥\d+-\d+-\d+॥", line)
            if not match:
                line_split = line.split(DOUBLE_VIRAMA)
                shloka_num = line_split[1]
                line = DOUBLE_VIRAMA.join(
                    [
                        line_split[0],
                        to_dev_numbers(f"{kANDa_num}-{sarga_num}-{shloka_num}"),
                        line_split[2],
                    ]
                )
        normalized_shloka_list.append(line)
    shloka_list = normalized_shloka_list

    # Adding Space before pUrNa virAma ॥ and ।
    # originally this problem found from 1-45 onwards
    spaced_shloka_list = []
    for i in range(len(shloka_list)):
        lines = shloka_list[i].splitlines()
        new_lines = []
        for line in lines:
            if DOUBLE_VIRAMA in line or SINGLE_VIRAMA in line:
                ind = (
                    line.index(DOUBLE_VIRAMA)
                    if DOUBLE_VIRAMA in line
                    else line.index(SINGLE_VIRAMA)
                )
                # adding space before virAma
                if line[ind - 1] != " ":
                    line = line[:ind] + " " + line[ind:]
            new_lines.append(line)
        line = "\n".join(new_lines)
        spaced_shloka_list.append(line)
    shloka_list = spaced_shloka_list

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
