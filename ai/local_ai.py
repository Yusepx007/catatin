from __future__ import annotations

import json
import re
import sys
from datetime import date, timedelta
from typing import Any


VALID_CATEGORIES = [
    "Makanan & Minuman",
    "Transportasi",
    "Belanja",
    "Hiburan",
    "Kesehatan",
    "Pendidikan",
    "Tagihan & Utilitas",
    "Lainnya",
]

CATEGORY_KEYWORDS = {
    "Makanan & Minuman": [
        "makan",
        "minum",
        "kopi",
        "nasi",
        "mie",
        "mi ",
        "ayam",
        "bakso",
        "sate",
        "seblak",
        "warteg",
        "resto",
        "restoran",
        "cafe",
        "kafe",
        "roti",
        "snack",
        "cemilan",
        "teh",
        "es ",
    ],
    "Transportasi": [
        "grab",
        "gojek",
        "ojol",
        "taksi",
        "bus",
        "mrt",
        "lrt",
        "angkot",
        "kereta",
        "bensin",
        "parkir",
        "tol",
        "transport",
        "naik",
    ],
    "Belanja": [
        "shopee",
        "tokopedia",
        "lazada",
        "marketplace",
        "baju",
        "celana",
        "sepatu",
        "tas",
        "barang",
        "skincare",
        "sabun",
        "laundry",
        "fotocopy",
        "print",
    ],
    "Hiburan": [
        "spotify",
        "netflix",
        "bioskop",
        "game",
        "konser",
        "nongkrong",
        "hiburan",
        "youtube",
        "cinema",
    ],
    "Kesehatan": [
        "obat",
        "dokter",
        "klinik",
        "rumah sakit",
        "vitamin",
        "apotek",
        "periksa",
        "masker",
    ],
    "Pendidikan": [
        "buku",
        "kampus",
        "kuliah",
        "kelas",
        "kursus",
        "sekolah",
        "spp",
        "modul",
        "belajar",
    ],
    "Tagihan & Utilitas": [
        "listrik",
        "air",
        "pdam",
        "wifi",
        "internet",
        "pulsa",
        "kuota",
        "kost",
        "kos",
        "kontrakan",
        "tagihan",
        "sewa",
        "bpjs",
    ],
}

MONTHS = {
    "jan": 1,
    "januari": 1,
    "feb": 2,
    "februari": 2,
    "mar": 3,
    "maret": 3,
    "apr": 4,
    "april": 4,
    "mei": 5,
    "jun": 6,
    "juni": 6,
    "jul": 7,
    "juli": 7,
    "agu": 8,
    "agustus": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "okt": 10,
    "oktober": 10,
    "nov": 11,
    "november": 11,
    "des": 12,
    "desember": 12,
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def parse_number(raw_number: str, suffix: str | None) -> int:
    number = raw_number.strip().lower().replace(" ", "")
    suffix = (suffix or "").lower()

    has_thousand_separator = bool(re.fullmatch(r"\d{1,3}(?:[.]\d{3})+", number))
    if has_thousand_separator:
        value = float(number.replace(".", ""))
    else:
        value = float(number.replace(",", "."))

    if suffix in {"rb", "ribu", "k"}:
        value *= 1_000
    elif suffix in {"jt", "juta", "mio"}:
        value *= 1_000_000

    return max(0, int(round(value)))


def find_amount(text: str) -> tuple[int, tuple[int, int]] | None:
    pattern = re.compile(
        r"(?P<currency>\brp\.?\s*)?"
        r"(?P<number>\d{1,3}(?:[.]\d{3})+|\d+(?:[,.]\d+)?)"
        r"\s*(?P<suffix>rb|ribu|k|jt|juta|mio)?\b",
        re.IGNORECASE,
    )

    candidates: list[tuple[int, int, tuple[int, int]]] = []
    for match in pattern.finditer(text):
        suffix = match.group("suffix")
        amount = parse_number(match.group("number"), suffix)
        has_marker = bool(match.group("currency") or suffix)
        score = amount + (1_000_000_000 if has_marker else 0)

        if amount >= 1_000 or has_marker:
            candidates.append((score, amount, match.span()))

    if not candidates:
        return None

    _, amount, span = max(candidates, key=lambda item: item[0])
    return amount, span


def parse_transaction_date(text: str, today: date) -> date:
    normalized = normalize_text(text)

    iso = re.search(r"\b(20\d{2})-(\d{1,2})-(\d{1,2})\b", normalized)
    if iso:
        return date(int(iso.group(1)), int(iso.group(2)), int(iso.group(3)))

    numeric = re.search(r"\b(\d{1,2})[/-](\d{1,2})(?:[/-](20\d{2}))?\b", normalized)
    if numeric:
        year = int(numeric.group(3)) if numeric.group(3) else today.year
        return date(year, int(numeric.group(2)), int(numeric.group(1)))

    month_names = "|".join(MONTHS.keys())
    named = re.search(rf"\b(\d{{1,2}})\s+({month_names})(?:\s+(20\d{{2}}))?\b", normalized)
    if named:
        year = int(named.group(3)) if named.group(3) else today.year
        return date(year, MONTHS[named.group(2)], int(named.group(1)))

    days_ago = re.search(r"\b(\d{1,2})\s+hari\s+lalu\b", normalized)
    if days_ago:
        return today - timedelta(days=int(days_ago.group(1)))

    if "kemarin lusa" in normalized:
        return today - timedelta(days=2)
    if "kemarin" in normalized or "semalam" in normalized:
        return today - timedelta(days=1)
    if "minggu lalu" in normalized:
        return today - timedelta(days=7)
    if "besok" in normalized:
        return today + timedelta(days=1)

    return today


def infer_category(text: str) -> str:
    normalized = f" {normalize_text(text)} "
    scores: dict[str, int] = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            key = keyword if keyword.endswith(" ") else f"{keyword}"
            if key in normalized:
                score += 2 if len(keyword.strip()) > 4 else 1
        if score:
            scores[category] = score

    if not scores:
        return "Lainnya"

    return max(scores.items(), key=lambda item: item[1])[0]


def build_description(text: str, amount_span: tuple[int, int]) -> str:
    cleaned = text[: amount_span[0]] + " " + text[amount_span[1] :]
    cleaned = re.sub(
        r"\b(tadi|pagi|siang|sore|malam|hari ini|kemarin|kemarin lusa|semalam|minggu lalu|besok)\b",
        " ",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\b\d{1,2}\s+hari\s+lalu\b", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b(20\d{2}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]20\d{2})?)\b", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .,-")

    if not cleaned:
        cleaned = "Pengeluaran"

    cleaned = cleaned[:50].strip()
    return cleaned[:1].upper() + cleaned[1:]


def parse_transaction(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()
    amount_result = find_amount(text)
    if amount_result is None:
        raise ValueError('Nominal belum terbaca. Contoh: "beli kopi 25rb tadi pagi".')

    amount, amount_span = amount_result
    transaction_date = parse_transaction_date(text, date.today())

    return {
        "category": infer_category(text),
        "amount": min(amount, 100_000_000),
        "transaction_date": transaction_date.isoformat(),
        "description": build_description(text, amount_span),
    }


def generate_weekly_insight(transactions: list[dict[str, Any]]) -> str:
    valid = [t for t in transactions if int(t.get("amount") or 0) > 0]
    if not valid:
        return "Belum ada transaksi minggu ini. Mulai catat pengeluaran untuk mendapatkan insight."

    totals: dict[str, int] = {}
    for transaction in valid:
        category = str(transaction.get("category") or "Lainnya")
        totals[category] = totals.get(category, 0) + int(transaction.get("amount") or 0)

    top_category, top_amount = max(totals.items(), key=lambda item: item[1])
    total_amount = sum(totals.values())
    share = round((top_amount / total_amount) * 100)

    suggestions = {
        "Makanan & Minuman": "coba tetapkan limit makan harian",
        "Transportasi": "cek opsi rute atau jadwal yang lebih hemat",
        "Belanja": "tunda belanja non-wajib selama 24 jam",
        "Hiburan": "pilih satu langganan utama minggu ini",
        "Kesehatan": "sisihkan dana kesehatan agar tidak mengganggu budget lain",
        "Pendidikan": "pisahkan kebutuhan belajar dari belanja impulsif",
        "Tagihan & Utilitas": "catat tanggal jatuh tempo agar cashflow lebih rapi",
        "Lainnya": "beri deskripsi lebih detail agar pola pengeluaran makin jelas",
    }

    insight = (
        f"{top_category} menyerap {share}% pengeluaran minggu ini; "
        f"{suggestions.get(top_category, suggestions['Lainnya'])}."
    )
    return insight[:119].rstrip(" ;,.") + "."


def main() -> int:
    if len(sys.argv) < 2:
        raise ValueError("Command wajib diisi: parse atau insight.")

    command = sys.argv[1]
    payload = json.load(sys.stdin)

    if command == "parse":
        result = parse_transaction(str(payload.get("rawText") or ""))
    elif command == "insight":
        transactions = payload.get("transactions")
        if not isinstance(transactions, list):
            raise ValueError("transactions harus berupa array.")
        result = {"insight": generate_weekly_insight(transactions)}
    else:
        raise ValueError(f"Command tidak dikenal: {command}")

    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False))
        raise SystemExit(1)
