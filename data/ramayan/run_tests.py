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
        test_title=f"Check for Single Line Shlokas",
        test_info="Single line shlokas found",
        report_test_fail_if_found=False,
    ),  # 2
    TestInfo(
        test_title=f"Check for Line Count more than 3",
        test_info="Shlokas with more than 3 lines",
        report_test_fail_if_found=False,
    ),  # 3
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
    # if check_kANDa_sarga(2, 1):
    #     EMPTY_TEST.failed_cases.append("1-16")
    #     EMPTY_TEST.failed_cases.append("2-37")

    # check if before a line break only single or double is sent
    # this test case actually is not needed after we have updared our json extraction algorithm
    VIRAMA_TEST = TEST_INFO[1]
    SINGLE_LINE_TEST = TEST_INFO[2]
    MORE_THAN_3_TEST = TEST_INFO[3]
    for ln_ind, lines in enumerate(data):
        # ln_ind will act as shloka number as first line in start
        for line in lines.splitlines():
            if line[-1] not in (
                SINGLE_VIRAMA,
                DOUBLE_VIRAMA,
            ):
                VIRAMA_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}-{ln_ind+1}")
            # if check_kANDa_sarga(1, 1):
            #     VIRAMA_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}-{ln_ind+1}")
        if ln_ind not in (0, len(data) - 1):
            if lines.count(NEW_LINE) == 0:
                # if not starting or ending line but still a single line
                SINGLE_LINE_TEST.failed_cases.append(
                    f"{kANDa_num}-{sarga_num}-{ln_ind+1}"
                )
            elif lines.count(NEW_LINE) > 3:
                MORE_THAN_3_TEST.failed_cases.append(
                    f"{kANDa_num}-{sarga_num}-{ln_ind+1} -> {lines.count(NEW_LINE)}"
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
                prev + len(val.failed_cases) if val.report_test_fail_if_found else 0
            ),
            TEST_INFO,
            0,
        )
        == 0
    )  # if no failed cases
    RENDER_DATA = {"all_tests_passed": all_tests_passed, "test_info": TEST_INFO}
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
