from __future__ import annotations

import math
import random
import struct
import zlib
from pathlib import Path

SIZE = 2048
OUT = Path(__file__).resolve().parents[1] / "public" / "textures"
OUT.mkdir(parents=True, exist_ok=True)
random.seed(42)


def write_png(path: Path, width: int, height: int, rows: list[bytes]) -> None:
    raw = b"".join(b"\x00" + row for row in rows)
    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 6))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def normal_from_height(height_fn, strength: float = 4.0) -> list[bytes]:
    heights = [[0.0] * SIZE for _ in range(SIZE)]
    for y in range(SIZE):
        ny = y / SIZE
        row = heights[y]
        for x in range(SIZE):
            row[x] = height_fn(x / SIZE, ny)
    rows: list[bytes] = []
    for y in range(SIZE):
        data = bytearray()
        y0 = max(0, y - 1)
        y1 = min(SIZE - 1, y + 1)
        for x in range(SIZE):
            x0 = max(0, x - 1)
            x1 = min(SIZE - 1, x + 1)
            dx = (heights[y][x1] - heights[y][x0]) * strength
            dy = (heights[y1][x] - heights[y0][x]) * strength
            nx, ny, nz = -dx, -dy, 1.0
            length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            nx, ny, nz = nx / length, ny / length, nz / length
            data.extend((int((nx * 0.5 + 0.5) * 255), int((ny * 0.5 + 0.5) * 255), int((nz * 0.5 + 0.5) * 255)))
        rows.append(bytes(data))
    return rows


def wood_height(u: float, v: float) -> float:
    rings = math.sin((u * 18 + math.sin(v * 15) * 0.35) * math.pi * 2) * 0.4
    grain = math.sin((u * 90 + v * 9) * math.pi * 2) * 0.08
    knots = 0.0
    for cx, cy in [(0.22, 0.32), (0.68, 0.57), (0.48, 0.78)]:
        d = math.hypot(u - cx, v - cy)
        knots += math.sin(d * 90) * max(0.0, 0.15 - d)
    return rings + grain + knots


def tire_height(u: float, v: float) -> float:
    diagonal = 1.0 if ((u * 12 + v * 18) % 2.0) < 0.82 else -1.0
    grooves = -0.7 if abs((u * 28) % 1.0 - 0.5) < 0.08 else 0.0
    micro = math.sin(v * 240 * math.pi) * 0.04
    return diagonal + grooves + micro


def cardboard_height(u: float, v: float) -> float:
    waves = math.sin(u * 60 * math.pi) * 0.45
    fibers = math.sin((u * 19 + v * 47) * math.pi * 2) * 0.08
    return waves + fibers


def metallic_height(u: float, v: float) -> float:
    scratches = 0.0
    scratches += math.sin((u * 500 + v * 7) * math.pi * 2) * 0.025
    scratches += math.sin((u * 31 - v * 97) * math.pi * 2) * 0.02
    flakes = 0.09 if int(u * 220) % 17 == 0 and int(v * 220) % 13 == 0 else 0.0
    return scratches + flakes


def brushed_height(u: float, v: float) -> float:
    lines = math.sin(u * 800 * math.pi) * 0.07
    cross = math.sin(v * 12 * math.pi) * 0.015
    return lines + cross


write_png(OUT / "wood_grain_normal.png", SIZE, SIZE, normal_from_height(wood_height, 7.0))
write_png(OUT / "tire_tread_normal.png", SIZE, SIZE, normal_from_height(tire_height, 8.0))
write_png(OUT / "cardboard_wave_normal.png", SIZE, SIZE, normal_from_height(cardboard_height, 5.0))
write_png(OUT / "metallic_flake_normal.png", SIZE, SIZE, normal_from_height(metallic_height, 12.0))
write_png(OUT / "brushed_metal_normal.png", SIZE, SIZE, normal_from_height(brushed_height, 10.0))

# Color cardboard texture requested in the specification.
rows = []
for y in range(SIZE):
    row = bytearray()
    for x in range(SIZE):
        u, v = x / SIZE, y / SIZE
        wave = int(12 * math.sin(u * 60 * math.pi))
        fiber = int(8 * math.sin((u * 19 + v * 47) * math.pi * 2))
        row.extend((184 + wave + fiber, 149 + wave // 2 + fiber // 2, 107 + fiber // 3))
    rows.append(bytes(row))
write_png(OUT / "cardboard_wave.png", SIZE, SIZE, rows)

# Displacement map as RGB grayscale for broad compatibility.
rows = []
for y in range(SIZE):
    row = bytearray()
    for x in range(SIZE):
        h = wood_height(x / SIZE, y / SIZE)
        g = max(0, min(255, int(128 + h * 70)))
        row.extend((g, g, g))
    rows.append(bytes(row))
write_png(OUT / "wood_planks_disp.png", SIZE, SIZE, rows)

print(f"Generated textures in {OUT}")
