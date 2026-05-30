"""Translate Spanish digest markdown to English via Claude."""

import logging

import anthropic

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a professional financial translator specializing in Argentine economic news. "
    "Translate the provided digest from Spanish to English for an English-speaking financial audience. "
    "Keep all Markdown formatting, links, dates, and numbers exactly as they are. "
    "Translate naturally and fluently. "
    "Keep proper nouns (company names, people names, places) in their original form."
)

TRANSLATE_INSTRUCTION = (
    "Translate this Argentine economic news digest from Spanish to English. "
    "Keep all Markdown formatting, links, dates, and numbers exactly as they are. "
    "Translate naturally — this is for an English-speaking financial audience. "
    "Keep proper nouns (company names, people names, places) in their original form."
)


def translate_digest(content: str, client: anthropic.Anthropic) -> str:
    """Return the English translation of a Spanish digest, or raise on failure."""
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=8192,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"{TRANSLATE_INSTRUCTION}\n\n{content}",
            }
        ],
    )
    return response.content[0].text.strip()
