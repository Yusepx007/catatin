from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai.local_ai import generate_weekly_insight, parse_transaction


class ParseRequest(BaseModel):
    rawText: str = Field(min_length=3, max_length=500)


class InsightRequest(BaseModel):
    transactions: list[dict[str, Any]] = Field(default_factory=list, max_length=200)


app = FastAPI(title="Catatin Python AI", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def verify_ai_secret(x_ai_secret: str | None = Header(default=None)) -> None:
    expected = os.getenv("AI_SHARED_SECRET")
    if expected and x_ai_secret != expected:
        raise HTTPException(status_code=401, detail="AI secret tidak valid.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/parse")
def parse(payload: ParseRequest, x_ai_secret: str | None = Header(default=None)) -> dict[str, Any]:
    verify_ai_secret(x_ai_secret)
    try:
        return parse_transaction(payload.rawText)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/insight")
def insight(payload: InsightRequest, x_ai_secret: str | None = Header(default=None)) -> dict[str, str]:
    verify_ai_secret(x_ai_secret)
    return {"insight": generate_weekly_insight(payload.transactions)}
