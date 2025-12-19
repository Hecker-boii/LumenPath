import pandas as pd
from pathlib import Path

DATA_PATH = Path("data/processed")


class FeatureStore:
    def __init__(self):
        self.interactions = pd.read_parquet(
            DATA_PATH / "interactions.parquet"
        )
        self.interactions["timestamp"] = pd.to_datetime(
            self.interactions["timestamp"]
        )

    def get_student_df(self, student_id):
        return (
            self.interactions[
                self.interactions["student_id"] == student_id
            ]
            .sort_values("timestamp")
            .reset_index(drop=True)
        )

    def compute_engagement_features(self, student_id):
        df = self.get_student_df(student_id)

        if df.empty:
            return None

        return {
            "total_interactions": len(df),
            "avg_time_spent": df["time_spent"].mean(),
            "active_days": (
                df["timestamp"].max() - df["timestamp"].min()
            ).days
            + 1,
            "max_inactivity_gap": (
                df["timestamp"].diff().dt.days.max()
            ),
        }

    def record_interaction(
        self,
        student_id,
        concept_id,
        is_correct: bool,
        time_spent: float = 0.0,
        activity_type: str = "practice",
        difficulty: str = "medium",
        timestamp=None,
    ):
        """Append a new interaction to the in-memory DataFrame and persist to parquet.

        This is a simple, robust append used for demo/testing. It does not enforce
        strict schema beyond required fields.
        """
        if timestamp is None:
            timestamp = pd.Timestamp.now()

        # normalize difficulty to numeric for compatibility with existing parquet
        if isinstance(difficulty, str):
            diff_map = {"easy": 0.25, "medium": 0.5, "hard": 0.75, "reinforce": 0.0, "mixed": 0.5}
            difficulty_val = diff_map.get(difficulty.lower(), 0.5)
        else:
            try:
                difficulty_val = float(difficulty)
            except Exception:
                difficulty_val = 0.5

        row = {
            "student_id": str(student_id),
            "timestamp": pd.to_datetime(timestamp),
            "activity_id": f"auto_{student_id}_{int(pd.Timestamp.now().timestamp())}",
            "concept_id": concept_id,
            "is_correct": int(bool(is_correct)),
            "attempts": int(1),
            "time_spent": float(time_spent),
            "activity_type": activity_type,
            "difficulty": float(difficulty_val),
        }

        new_df = pd.DataFrame([row])
        # maintain same columns order by concatenating
        self.interactions = pd.concat([self.interactions, new_df], ignore_index=True, sort=False)

        # ensure consistent dtypes (student_id as string) to avoid parquet conversion errors
        try:
            self.interactions["student_id"] = self.interactions["student_id"].astype(str)
        except Exception:
            pass

        # persist
        (DATA_PATH / "interactions.parquet").parent.mkdir(parents=True, exist_ok=True)
        self.interactions.to_parquet(DATA_PATH / "interactions.parquet", index=False)

        return row
