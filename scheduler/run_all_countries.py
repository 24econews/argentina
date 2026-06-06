"""Run the daily digest pipeline for every active country."""

import logging
import os
import subprocess
import sys
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

COUNTRIES = ["argentina", "brazil"]

PIPELINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "daily_pipeline.py")


def run_country(country: str) -> None:
    start = datetime.now()
    logger.info(f"[{country}] Starting pipeline…")
    try:
        subprocess.run(
            [sys.executable, PIPELINE, "--country", country],
            check=True,
        )
        elapsed = int((datetime.now() - start).total_seconds())
        logger.info(f"[{country}] Completed in {elapsed}s")
    except subprocess.CalledProcessError as exc:
        elapsed = int((datetime.now() - start).total_seconds())
        logger.error(f"[{country}] Pipeline failed after {elapsed}s: {exc}")


if __name__ == "__main__":
    logger.info("=== run_all_countries started ===")
    for country in COUNTRIES:
        run_country(country)
    logger.info("=== run_all_countries finished ===")
