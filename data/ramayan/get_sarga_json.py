#!/usr/bin/env python3

import os
import re
import time
from copy import deepcopy

from pyquery import PyQuery
import typer
from rich.console import Console
from rich import print
from rich.prompt import Confirm
import shubhlipi as sh
from pydantic import BaseModel
import yaml

from run_tests import run_tests

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
SPACE = " "
DEV_RANGE = [2304, 2431]


def in_dev_range(char: str):
    """Check if the character is in devanagari range"""
    code = ord(char)
    return code <= DEV_RANGE[1] and code >= DEV_RANGE[0]


def from_dev_numbers(text: str):
    for i, num in enumerate(NUMBERS):
        text = text.replace(num, str(i))
    return text


def to_dev_numbers(text: str):
    for i, num in enumerate(NUMBERS):
        text = text.replace(str(i), num)
    return text


def print_text(text: str):
    sh.write("a.txt", text)


def get_formward_string(
    text: str, current_index: int, forward: int, include_current_index=False
):
    # this is to safely get the forward string, if the forward is more than the length of the text return till last
    current_index_modifier = int(not include_current_index)
    return (
        text[current_index + current_index_modifier : current_index + forward + 1]
        if current_index + forward < len(text)
        else text[current_index + current_index_modifier :]
    )


class SargaInfo(BaseModel):
    name_devanagari: str
    name_normal: str
    index: int
    shloka_count: int
    shloka_count_extracted: int


class KAndaInfo(BaseModel):
    name_devanagari: str
    name_normal: str
    index: int
    sarga_count: int
    sarga_count_extracted: int
    sarga_data: list[SargaInfo]


DATA = [KAndaInfo(**data) for data in sh.load_json(sh.read("ramayan_map.json"))]
SANSKRIT_NUMBER_NAMES: list[list[int, str]] = yaml.safe_load(sh.read("numbers.yaml"))


def get_shloka_json(path: str):
    """extract the shlokas from html and save them into json"""

    text = sh.read(path)
    html = PyQuery(text)
    # these nums are in normal formaat
    kANDa_num = path.split("/")[-2].split(".")[0]
    sarga_num = path.split("/")[-1].split("_")[-1].split(".")[0]

    def check_kANDa_sarga(kanda: int, sarga: int):
        """Check if the kANDa and sarga are same"""
        if kANDa_num == str(kanda) and sarga_num == str(sarga):
            return True
        return False

    def check_kANDa(kanda: int):
        """Check if the kANDa is same"""
        if kANDa_num == str(kanda):
            return True
        return False

    if check_kANDa(7):
        return

    # if not check_kANDa_sarga(1, 1):
    #     return

    kANDa_info = DATA[int(kANDa_num) - 1]
    sarga_info = kANDa_info.sarga_data[int(sarga_num) - 1]

    shloka_extractor = html(
        "#mw-content-text > div.mw-content-ltr.mw-parser-output > div.poem > p"
    )
    shlokAni: str = ""

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

    shloka_list: list[str] = []

    def get_first_line():
        template = (
            lambda kANDa_dev_name, sarga_dev_name, sanskrit_number_sarga: f"श्रीमद्वाल्मीकीयरामायणे {kANDa_dev_name} {sarga_dev_name} नाम {sanskrit_number_sarga} सर्गः ॥{to_dev_numbers(kANDa_num)}-{to_dev_numbers(sarga_num)}॥"
        )
        e_mAtrA = "े"  # from 1st to 7nd vibhakti
        kANDa_name = kANDa_info.name_devanagari[:-1] + e_mAtrA
        line = template(
            kANDa_name,
            sarga_info.name_devanagari,
            SANSKRIT_NUMBER_NAMES[int(sarga_num) - 1][1],
        )
        return line

    def get_last_line():
        template = (
            lambda kANDa_dev_name, sanskrit_number_sarga: f"इत्यार्षे श्रीमद्रामायणे वाल्मीकीये आदिकाव्ये {kANDa_dev_name} {sanskrit_number_sarga} सर्गः ॥{to_dev_numbers(kANDa_num)}-{to_dev_numbers(sarga_num)}॥"
        )
        e_mAtrA = "े"
        kANda_name = kANDa_info.name_devanagari[:-1] + e_mAtrA
        line = template(kANda_name, SANSKRIT_NUMBER_NAMES[int(sarga_num) - 1][1])
        return line

    shloka_list.append(get_first_line())

    def normalize_line(line):
        line = line.strip()  # stripping the leading and trailing spaces
        replaces = {
            "<b>": "",
            "</b>": "",
            "'''": "",
            f"{SINGLE_VIRAMA}{SINGLE_VIRAMA}": DOUBLE_VIRAMA,
        }
        for k, v in replaces.items():
            line = line.replace(k, v)
        return line

    def is_permitted_dev_char(char: str):
        return (
            in_dev_range(char)
            and char not in NUMBERS
            and char not in (SINGLE_VIRAMA, DOUBLE_VIRAMA)
        )

    # Analysing the main shlokas
    current_shloka: str = ""
    line_ended: bool = False
    shloka_numb: int = 1
    for line in shlokAni.split("\n"):
        line = normalize_line(line)
        NOT_STARTS_WITH = [
            "$",
            "%",
            "&",
            "(",
            "इत्यार्षे श्रीमद्रामायणे वाल्मीकीये",
            "श्रीमद्वाल्मीकियरामायणे",
            "श्रीमद्वाल्मीकीयरामायणे",
        ]
        continue_status = False
        for nsw in NOT_STARTS_WITH:
            if line.startswith(nsw):
                continue_status = True
                break
        if continue_status:
            continue

        for i, char in enumerate(line):
            if not line_ended:
                # to be more careful before we consider the double virama
                # we have to see that if after that it is terminated another double virama and at least one
                # devanagari number in between
                # the more than 1 single virama was there on 1-1-84
                double_virama_condition = current_shloka != "" and char == DOUBLE_VIRAMA
                if double_virama_condition:
                    str_to_search = get_formward_string(line, i, 10)  # 3+1+3+3
                    another_double_virama_loc = str_to_search.find(DOUBLE_VIRAMA)
                    if another_double_virama_loc != -1:
                        str_to_search_for_dev_numbers = str_to_search[
                            :another_double_virama_loc
                        ]
                        atleast_one_dev_number_found = False
                        for dev_num in NUMBERS:
                            if dev_num in str_to_search_for_dev_numbers:
                                atleast_one_dev_number_found = True
                        if not atleast_one_dev_number_found:
                            double_virama_condition = False
                    else:
                        double_virama_condition = False
                        if check_kANDa_sarga(1, 1) and shloka_numb == 100:
                            char = SINGLE_VIRAMA

                if double_virama_condition:
                    if len(current_shloka) > 0 and current_shloka[-1] != SPACE:
                        current_shloka += SPACE  # add space before danda if not there
                    current_shloka += (
                        DOUBLE_VIRAMA
                        + to_dev_numbers(f"{kANDa_num}-{sarga_num}-{shloka_numb}")
                        + DOUBLE_VIRAMA
                    )
                    shloka_list.append(current_shloka)
                    current_shloka = ""
                    shloka_numb += 1
                    line_ended = False
                elif current_shloka != "" and char == SINGLE_VIRAMA:
                    if len(current_shloka) > 0 and current_shloka[-1] != SPACE:
                        current_shloka += SPACE  # add space before danda if not there
                    current_shloka += char + "\n"
                    line_ended = True
                elif is_permitted_dev_char(char) or (
                    current_shloka != ""
                    and char == SPACE
                    and (len(current_shloka) > 0 and current_shloka[-1] != SPACE)
                ):  # accept space if in middle of shloka only and one only one max space
                    current_shloka += char
            else:
                if is_permitted_dev_char(char):
                    current_shloka += char
                    line_ended = False

    shloka_list.append(get_last_line())

    print_text(shlokAni)

    out_folder = f"{OUTPUT_DATA_FOLDER}/{kANDa_num}/{sarga_num}.json"
    sh.write(out_folder, sh.dump_json(shloka_list, 2))


@app.command()
def main(
    no_confirm: bool = typer.Option(True, "--no-confirm", "-y"), run_test: bool = True
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

    for kANDa_name in os.listdir(RAW_DATA_FOLDER):
        # Only taking the number to create json folder
        sh.makedir(f"{OUTPUT_DATA_FOLDER}/{kANDa_name.split(".")[0]}")

    start_time = time.time()
    for root, _, files in os.walk(RAW_DATA_FOLDER):
        for file in files:
            path = os.path.join(root, file)
            get_shloka_json(path)
    end_time = time.time()
    console.print(f"[white bold]Time: {round(end_time-start_time)}s[/]")

    # running tests after each scraping
    # if run_test:
    #     run_tests()


if __name__ == "__main__":
    app()
