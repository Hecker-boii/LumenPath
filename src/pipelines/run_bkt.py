from src.storage.feature_store import FeatureStore
from src.models.bkt import BKTModel


def run_bkt():
    fs = FeatureStore()
    bkt = BKTModel()

    df = fs.interactions.sort_values("timestamp")

    mastery_log = []

    for _, row in df.iterrows():
        mastery = bkt.update(
            student_id=row["student_id"],
            concept_id=row["concept_id"],
            correct=row["is_correct"],
        )

        mastery_log.append(
            {
                "student_id": row["student_id"],
                "concept_id": row["concept_id"],
                "timestamp": row["timestamp"],
                "mastery": mastery,
            }
        )

    return mastery_log


if __name__ == "__main__":
    mastery = run_bkt()
    print("Sample mastery updates:")
    for m in mastery[:5]:
        print(m)
