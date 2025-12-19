import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

from data.schemas.interaction_schema import InteractionEvent

RAW_PATH = Path("data/raw")
OUT_PATH = Path("data/processed")
OUT_PATH.mkdir(parents=True, exist_ok=True)

COURSE_START = datetime(2013, 1, 1)


def ingest_student_vle():
    csv_path = RAW_PATH / "studentVle.csv"
    print(f"[INFO] Reading file: {csv_path.resolve()}")

    df = pd.read_csv(csv_path)
    print(f"[INFO] Rows loaded from CSV: {len(df)}")

    interactions = []

    for i, row in df.iterrows():
        try:
            day_offset = int(row["date"])
            timestamp = COURSE_START + timedelta(days=day_offset)
        except Exception:
            continue

        event = InteractionEvent(
            student_id=str(row["id_student"]),
            timestamp=timestamp,
            activity_id=str(row["id_site"]),
            concept_id="unknown",
            is_correct=1,
            attempts=1,
            time_spent=float(row["sum_click"]),
            activity_type="vle",
            difficulty=0.5,
        )

        interactions.append(event)

        # Early stop for sanity test
        if len(interactions) == 5:
            break

    print(f"[INFO] InteractionEvents created: {len(interactions)}")
    return interactions


def main():
    print("[INFO] Starting OULAD ingestion")

    interactions = ingest_student_vle()

    if not interactions:
        print("[ERROR] No interactions created. Exiting.")
        return

    df = pd.DataFrame([vars(e) for e in interactions])
    out_file = OUT_PATH / "interactions.parquet"

    df.to_parquet(out_file, index=False)

    print(f"[SUCCESS] Saved parquet to: {out_file.resolve()}")
    print(df.head())


if __name__ == "__main__":
    main()
