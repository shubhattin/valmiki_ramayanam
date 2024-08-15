#!/usr/bin/env python3

import os
from functools import reduce

from pydantic import BaseModel
from rich.console import Console
from typer import Typer
import shubhlipi as sh
from common import render_template, DOUBLE_VIRAMA, SINGLE_VIRAMA, NEW_LINE, DATA

app = Typer()
console = Console()

DATA_FOLDER = "data"


class TestInfo(BaseModel):
    test_title: str
    test_info: str
    failed_cases: list[str] = []
    report_test_fail_if_found: bool = True


TEST_INFO: list[TestInfo] = [
    TestInfo(
        test_title="Check for empty json files",
        test_info="These files are empty",
    ),  # 0
    TestInfo(
        test_title=f"Check for {SINGLE_VIRAMA} or {DOUBLE_VIRAMA} before line break",
        test_info="virAma not present before new line in",
    ),  # 1
    TestInfo(
        test_title=f"Single Line Shlokas",
        test_info="Single line shlokas found",
        report_test_fail_if_found=False,
    ),  # 2
    TestInfo(
        test_title=f"Line Count more than 3",
        test_info="Shlokas with more than 3 lines",
        report_test_fail_if_found=False,
    ),  # 3
    TestInfo(
        test_title="Variance in Shloka Count from Book Source",
        test_info="Sargas with Shloka count variance (`L → extracted|R → book|difference from book`)",
        report_test_fail_if_found=False,
    ),  # 4
    TestInfo(
        test_title=f"Check for {DOUBLE_VIRAMA} at the end of shloka",
        test_info="Double virAma not present at the end in these shlokas",
    ),  # 5
]


def _run_tests(data: list[str], kANDa_num: str, sarga_num: str):
    global TEST_INFO

    def check_kANDa_sarga(kanda: int, sarga: int):
        """Check if the kANDa and sarga are same"""
        if kANDa_num == str(kanda) and sarga_num == str(sarga):
            return True
        return False

    EMPTY_TEST = TEST_INFO[0]
    if len(data) <= 2:
        EMPTY_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}")
        return
    # if check_kANDa_sarga(2, 1):
    #     EMPTY_TEST.failed_cases.append("1-16")
    #     EMPTY_TEST.failed_cases.append("2-37")
    #     return

    # check if before a line break only single or double is sent
    # this test case actually is not needed after we have updared our json extraction algorithm
    VIRAMA_TEST = TEST_INFO[1]
    SINGLE_LINE_TEST = TEST_INFO[2]
    MORE_THAN_3_TEST = TEST_INFO[3]
    DOUBLE_VIRAMA_TEST = TEST_INFO[5]
    for ln_ind, lines in enumerate(data):
        # ln_ind will act as shloka number as first line in start
        if lines.count(DOUBLE_VIRAMA) != 2:
            DOUBLE_VIRAMA_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}-{ln_ind}")
        for line in lines.splitlines():
            if line[-1] not in (
                SINGLE_VIRAMA,
                DOUBLE_VIRAMA,
            ):
                VIRAMA_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}-{ln_ind}")
        # if check_kANDa_sarga(1, 1):
        #     VIRAMA_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}-{ln_ind+1}")
        if ln_ind not in (0, len(data) - 1):
            if lines.count(NEW_LINE) == 0:
                # if not starting or ending line but still a single line
                SINGLE_LINE_TEST.failed_cases.append(
                    f"{kANDa_num}-{sarga_num}-{ln_ind}"
                )
            elif lines.count(NEW_LINE) >= 3:  # checking for 4 lined and more
                MORE_THAN_3_TEST.failed_cases.append(
                    f"{kANDa_num}-{sarga_num}-{ln_ind} → {lines.count(NEW_LINE) + 1}"
                )

    SARGA_SHLOKA_COUNT_TEST = TEST_INFO[4]
    sarga_info = DATA[int(kANDa_num) - 1].sarga_data[int(sarga_num) - 1]
    if sarga_info.shloka_count != sarga_info.shloka_count_extracted:
        SARGA_SHLOKA_COUNT_TEST.failed_cases.append(
            f"{kANDa_num}-{sarga_num} → {sarga_info.shloka_count_extracted}|{sarga_info.shloka_count}| "
            + (
                "+"
                if sarga_info.shloka_count_extracted > sarga_info.shloka_count
                else "-"
            )
            + f"{abs(sarga_info.shloka_count_extracted - sarga_info.shloka_count)}"
        )


@app.command()
def run_tests():
    global TEST_INFO
    if not os.path.isdir(DATA_FOLDER):
        console.print("[bold red]Raw Data folder not found![/]")
        exit(-1)
    for kANDa_info in DATA:
        for sarga in kANDa_info.sarga_data:
            data = sh.load_json(
                sh.read(f"{DATA_FOLDER}/{kANDa_info.index}/{sarga.index}.json")
            )
            _run_tests(data, str(kANDa_info.index), str(sarga.index))

    all_tests_passed = (
        reduce(
            lambda prev, val: (
                prev + (len(val.failed_cases) if val.report_test_fail_if_found else 0)
            ),
            TEST_INFO,
            0,
        )
        == 0
    )  # if no failed cases
    RENDER_DATA = {
        "all_tests_passed": all_tests_passed,
        "test_info": TEST_INFO,
        "filter_function": lambda lst, start_text: list(
            filter(lambda x: x.startswith(f"{start_text}-"), lst)
        ),
    }
    RENDERRED_OUTPUT_MD = render_template("test_out_template.md.j2", **RENDER_DATA)
    sh.write("test_output.md", RENDERRED_OUTPUT_MD)

    if all_tests_passed:
        console.print("[bold green]✔ All Tests passed![/]")
        exit(0)
    else:
        console.print("\n[bold red]❌ Some Tests failed![/]")
        exit(-1)


if __name__ == "__main__":
    app()
