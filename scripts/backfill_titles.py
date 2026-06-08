#!/usr/bin/env python3
"""Backfill > TITLE: lines into digest .md files that are missing them."""

import os
import sys
import glob
import anthropic

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIGEST_DIRS = [
    os.path.join(REPO_ROOT, "digests"),
    os.path.join(REPO_ROOT, "digests", "brazil"),
]

api_key = os.environ.get("ANTHROPIC_API_KEY") or _load_env_key()

def _load_env_key() -> str:
    env_path = os.path.join(REPO_ROOT, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return ""


def load_env_key() -> str:
    env_path = os.path.join(REPO_ROOT, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return ""


def get_api_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY") or load_env_key()
    if not key:
        print("ERROR: ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(1)
    return key


def has_title(content: str) -> bool:
    for line in content.splitlines()[:5]:
        if line.startswith("> TITLE:"):
            return True
    return False


def first_500_words(content: str) -> str:
    words = content.split()
    return " ".join(words[:500])


def generate_title(client: anthropic.Anthropic, excerpt: str) -> str:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=60,
        messages=[
            {
                "role": "user",
                "content": (
                    "Read this economic narrative and write a single compelling headline "
                    "in English, max 12 words, Bloomberg/Politico style. "
                    "Return ONLY the headline, nothing else.\n\n"
                    + excerpt
                ),
            }
        ],
    )
    return response.content[0].text.strip().strip('"').strip("'")


def prepend_title(filepath: str, title: str) -> None:
    with open(filepath, "r", encoding="utf-8") as f:
        original = f.read()
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"> TITLE: {title}\n\n{original}")


def process_en_file(en_path: str, title: str) -> None:
    if not os.path.exists(en_path):
        return
    with open(en_path, "r", encoding="utf-8") as f:
        content = f.read()
    if has_title(content):
        return
    with open(en_path, "w", encoding="utf-8") as f:
        f.write(f"> TITLE: {title}\n\n{content}")


def main() -> None:
    client = anthropic.Anthropic(api_key=get_api_key())

    md_files = []
    for d in DIGEST_DIRS:
        md_files.extend(sorted(glob.glob(os.path.join(d, "digest_*.md"))))

    # Filter out .en.md files
    md_files = [f for f in md_files if not f.endswith(".en.md")]

    skipped = 0
    updated = 0

    for filepath in md_files:
        filename = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if has_title(content):
            # Still mirror title to .en.md in case it's missing there
            title_match = next(
                (line[len("> TITLE:"):].strip() for line in content.splitlines()[:5] if line.startswith("> TITLE:")),
                None,
            )
            if title_match:
                en_path = filepath.replace(".md", ".en.md")
                process_en_file(en_path, title_match)
            print(f"  skip {filename} (already has title)")
            skipped += 1
            continue

        excerpt = first_500_words(content)
        title = generate_title(client, excerpt)

        prepend_title(filepath, title)

        # Mirror title to the corresponding .en.md file
        en_path = filepath.replace(".md", ".en.md")
        process_en_file(en_path, title)

        country = "brazil" if "brazil" in filepath else "argentina"
        print(f"  ✓ [{country}] {filename}: {title}")
        updated += 1

    print(f"\nDone. {updated} updated, {skipped} already had titles.")


if __name__ == "__main__":
    main()
