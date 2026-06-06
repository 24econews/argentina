"""Article summarizer — replaced by narrative generation in digest_builder.py."""

import logging
from typing import List

import anthropic

from ingestion.rss_fetcher import Article

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = ""


def summarize_article(
    article: Article, client: anthropic.Anthropic, system_prompt: str = SYSTEM_PROMPT
) -> str:
    return article.summary or ""


def summarize_articles(
    articles: List[Article], client: anthropic.Anthropic, system_prompt: str = SYSTEM_PROMPT
) -> List[Article]:
    return articles
