#!/usr/bin/env python3

import os
from functools import reduce

from pydantic import BaseModel
from rich.console import Console
from typer import Typer
import shubhlipi as sh
from common import render_template, DOUBLE_VIRAMA, SINGLE_VIRAMA

app = Typer()
console = Console()

DATA_FOLDER = "data"


class TestInfo(BaseModel):
    test_title: str
    test_info_template: str
    failed_cases: list[str] = []


TEST_INFO: list[TestInfo] = [
    TestInfo(
        test_title="Check for empty json files",
        test_info_template="`{0}` is empty",
    ),  # 0
    TestInfo(
        test_title=f"Check for {SINGLE_VIRAMA} or {DOUBLE_VIRAMA} before line break",
        test_info_template="`{0}` virAma not present before \\n",
    ),  # 1
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
    VIRAMA_TEST = TEST_INFO[1]
    for ln_ind, lines in enumerate(data):
        # ln_ind will act as shloka number as first line in start
        for line in lines.splitlines():
            if line[-1] not in (
                SINGLE_VIRAMA,
                DOUBLE_VIRAMA,
            ):
                VIRAMA_TEST.failed_cases.append(f"{kANDa_num}-{sarga_num}-{ln_ind+1}")


@app.command()
def run_tests():
    global TEST_INFO
    if not os.path.isdir(DATA_FOLDER):
        console.print("[bold red]Raw Data folder not found![/]")
        exit(-1)
    for root, _, files in os.walk(DATA_FOLDER):
        for file in files:
            path = os.path.join(root, file)
            kANDa_num = path.split("/")[-2]
            sarga_num = path.split("/")[-1].split(".")[0]
            data = sh.load_json(sh.read(path))
            _run_tests(data, kANDa_num, sarga_num)

    all_tests_passed = (
        reduce(lambda prev, val: prev + len(val.failed_cases), TEST_INFO, 0) == 0
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
