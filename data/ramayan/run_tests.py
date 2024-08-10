import os

from rich.console import Console
from typer import Typer
import shubhlipi as sh

app = Typer()
console = Console()

DATA_FOLDER = "data"


def _run_tests(data: list[str], kANDa_num: int, sarga_num: int):
    if len(data) <= 2:
        console.print(f"[red bold]⚠️ [yellow]{kANDa_num}-{sarga_num}[/] is empty !![/]")
        return False


@app.command()
def run_tests():
    if not os.path.isdir(DATA_FOLDER):
        console.print("[bold red]Raw Data folder not found![/]")
        exit(-1)
    no_error = True
    for root, _, files in os.walk(DATA_FOLDER):
        for file in files:
            path = os.path.join(root, file)
            kANDa_num = path.split("/")[-2].split(".")[0]
            sarga_num = path.split("/")[-1].split("_")[-1].split(".")[0]
            data = sh.load_json(sh.read(path))
            out = _run_tests(data, kANDa_num, sarga_num)
            if no_error and not out:
                no_error = False
    if no_error:
        console.print("[bold green]All tests passed![/]")


if __name__ == "__main__":
    app()
