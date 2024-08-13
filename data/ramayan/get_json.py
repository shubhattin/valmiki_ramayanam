#!/usr/bin/env python3

import os
import time

import typer
from rich.console import Console
from rich.prompt import Confirm
import shubhlipi as sh

from run_tests import run_tests
from common import (
    DATA,
    DOUBLE_VIRAMA,
    SINGLE_VIRAMA,
    NUMBERS,
    SANSKRIT_NUMBER_NAMES,
    to_dev_numbers,
    in_dev_range,
    get_formward_string,
    SPACE,
)
import get_text


app = typer.Typer()
console = Console()

OUTPUT_DATA_FOLDER = "data"
TEXT_DATA_FOLDER = "text_data"


def get_shloka_json(path: str):
    """extract the shlokas from text and save them into json"""

    # these nums are in normal formaat
    kANDa_num = path.split("/")[-2]
    sarga_num = path.split("/")[-1].split(".")[0]

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

    kANDa_info = DATA[int(kANDa_num) - 1]
    sarga_info = kANDa_info.sarga_data[int(sarga_num) - 1]

    shlokAni: str = sh.read(f"{TEXT_DATA_FOLDER}/{kANDa_num}/{sarga_num}.txt")

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

        def check_kANDa_sarga_shloka(kANDa: int, sarga: int, shloka: int):
            if check_kANDa_sarga(kANDa, sarga) and shloka_numb == shloka:
                return True
            return False

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

    out_folder = f"{OUTPUT_DATA_FOLDER}/{kANDa_num}/{sarga_num}.json"
    sh.write(out_folder, sh.dump_json(shloka_list, 2))


@app.command()
def main(
    no_confirm: bool = typer.Option(True, "--no-confirm", "-y"), run_test: bool = True
):
    if not os.path.isdir(TEXT_DATA_FOLDER):
        console.print("[bold red]Text Data folder not found![/]")
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

    for kANDa_num in os.listdir(TEXT_DATA_FOLDER):
        # Only taking the number to create json folder
        sh.makedir(f"{OUTPUT_DATA_FOLDER}/{kANDa_num}")

    # Running get text
    get_text.main(use_existing_text=True)

    start_time = time.time()
    for root, _, files in os.walk(TEXT_DATA_FOLDER):
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
