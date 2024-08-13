import shubhlipi as sh
from pydantic import BaseModel
import yaml

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
NEW_LINE = "\n"
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
