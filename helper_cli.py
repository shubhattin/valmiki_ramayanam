#!/usr/bin/env python3

from rich import print
from rich.prompt import Prompt
import os

OPTIONS = [
    ["1. Generate JSON Files", "cd data/ramayan/ && python3 get_json.py"],
    [
        "2. Generate JSON Files + Excel zip",
        "cd data/ramayan/ && python3 get_json.py && npx tsx make_excel_files.ts",
    ],
    ["3. Launch the web app", "pnpm dev"],
]


def main():
    print("[bold yellow]Select an option to run:[/]")
    for option in OPTIONS:
        print(f"[blue]{option[0]}[/]")

    choice = Prompt.ask(
        "Choose an option", choices=[str(i + 1) for i in range(len(OPTIONS))]
    )

    try:
        command = OPTIONS[int(choice) - 1][1]
        os.system(command)
    except Exception as e:
        print(f"Invalid choice: {e}")


if __name__ == "__main__":
    main()
