import pandas as pd
import shap
from src.models.risk_xgb import RiskModel
from src.storage.feature_store import FeatureStore


def train_risk_model():
    fs = FeatureStore()

    # Aggregate per student
    df = fs.interactions.groupby("student_id").agg(
        avg_time_spent=("time_spent", "mean"),
        total_interactions=("time_spent", "count"),
        correct_rate=("is_correct", "mean"),
    ).reset_index()

    # Debug prints
    print("[DEBUG] Aggregated df head:\n", df.head())
    print("[DEBUG] dtypes:\n", df.dtypes)
    print("[DEBUG] correct_rate min/max:", df['correct_rate'].min(), df['correct_rate'].max())

    # Simulated label (hackathon-safe)
    df["at_risk"] = (df["correct_rate"] < 0.6).astype(int)

    X = df.drop(columns=["student_id", "at_risk"])
    y = df["at_risk"]

    # Guard: XGBoost requires labels with at least two classes
    if y.nunique() < 2:
        print("[WARN] Label `at_risk` is constant — synthesizing labels for demo run.")
        n = len(df)
        if n < 2:
            print("[WARN] Too few students (n={}) — creating synthetic demo dataset.".format(n))
            import numpy as np
            rng = np.random.RandomState(42)
            demo_n = 30
            demo_student_ids = [f"demo_{i}" for i in range(demo_n)]
            df = pd.DataFrame({
                "student_id": demo_student_ids,
                "avg_time_spent": rng.uniform(0.5, 10.0, size=demo_n),
                "total_interactions": rng.randint(1, 50, size=demo_n),
                "correct_rate": rng.uniform(0.2, 1.0, size=demo_n),
            })
            print("[INFO] Created synthetic demo dataset with {} students".format(demo_n))

        # Primary synthetic approach: mark 30% lowest-engagement students as at-risk
        df = df.sort_values("avg_time_spent")
        n = len(df)
        k = max(1, int(n * 0.3))
        synth_idx = df.index[:k]
        df.loc[:, "at_risk"] = 0
        df.loc[synth_idx, "at_risk"] = 1
        X = df.drop(columns=["student_id", "at_risk"])
        y = df["at_risk"]
        print("[INFO] Synthetic at_risk distribution:\n", y.value_counts())

        # If labels are still single-class (edge case for tiny datasets), fallback to median split
        if y.nunique() < 2:
            print("[WARN] Synthetic labels still single-class — using median-split fallback.")
            df.loc[:, "at_risk"] = (df["avg_time_spent"] < df["avg_time_spent"].median()).astype(int)
            X = df.drop(columns=["student_id", "at_risk"])
            y = df["at_risk"]
            print("[INFO] Fallback at_risk distribution:\n", y.value_counts())
    model = RiskModel()
    model.train(X, y)

    explainer = shap.Explainer(model.model, X)
    shap_values = explainer(X)

    print("Risk model trained")
    print("Sample SHAP explanation:")
    print(shap_values[0])

    return model


if __name__ == "__main__":
    train_risk_model()
