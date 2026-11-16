import sys
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [
    r"C:\Windows\Fonts\consola.ttf",
    r"C:\Windows\Fonts\cour.ttf",
]
FONT_BOLD_CANDIDATES = [
    r"C:\Windows\Fonts\consolab.ttf",
    r"C:\Windows\Fonts\courbd.ttf",
]

FONT_SIZE = 16
PADDING_X = 22
PADDING_TOP = 44
PADDING_BOTTOM = 22
LINE_SPACING = 6
WRAP_COLS = 100
WINDOW_WIDTH = 980

BG = (18, 20, 24)
TITLEBAR = (38, 40, 46)
FG_DEFAULT = (222, 226, 230)
FG_PROMPT = (98, 209, 150)
FG_HEADER = (110, 176, 255)
FG_DIM = (140, 146, 156)


def load_font(candidates, size):
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def colorize(line: str):
    stripped = line.strip()
    if stripped.startswith("=====") or stripped.startswith("---"):
        return FG_HEADER
    if stripped.startswith("$"):
        return FG_PROMPT
    if stripped == "":
        return FG_DIM
    return FG_DEFAULT


def render(title: str, body: str, out_path: str):
    font = load_font(FONT_CANDIDATES, FONT_SIZE)
    bold_font = load_font(FONT_BOLD_CANDIDATES, FONT_SIZE)

    wrapped_lines = []
    for raw_line in body.splitlines():
        if raw_line == "":
            wrapped_lines.append("")
            continue
        chunks = textwrap.wrap(
            raw_line, width=WRAP_COLS, subsequent_indent="    ",
            break_long_words=True, break_on_hyphens=False,
        ) or [""]
        wrapped_lines.extend(chunks)

    line_h = FONT_SIZE + LINE_SPACING
    height = PADDING_TOP + PADDING_BOTTOM + line_h * len(wrapped_lines)
    width = WINDOW_WIDTH

    img = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, width, 34], fill=(32, 32, 32))
    draw.rectangle([10, 10, 26, 24], outline=(204, 204, 204), width=1)
    draw.text((13, 11), ">_", fill=(204, 204, 204), font=font)
    draw.text((38, 17), title, fill=(230, 230, 230), font=bold_font, anchor="lm")
    cy = 17
    x = width - 138
    draw.line([x - 5, cy, x + 5, cy], fill=(220, 220, 220), width=1)
    x += 46
    draw.rectangle([x - 5, cy - 5, x + 5, cy + 5], outline=(220, 220, 220), width=1)
    x += 46
    draw.line([x - 5, cy - 5, x + 5, cy + 5], fill=(220, 220, 220), width=1)
    draw.line([x - 5, cy + 5, x + 5, cy - 5], fill=(220, 220, 220), width=1)

    y = PADDING_TOP
    for line in wrapped_lines:
        color = colorize(line)
        draw.text((PADDING_X, y), line, fill=color, font=font)
        y += line_h

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path)
    print(f"wrote {out_path} ({width}x{height})")


if __name__ == "__main__":
    title = sys.argv[1]
    body_file = sys.argv[2]
    out_path = sys.argv[3]
    body = Path(body_file).read_text(encoding="utf-8")
    render(title, body, out_path)
