from typing import Dict, Any

import numpy as np
import pandas as pd
import torch

from src.storage.feature_store import FeatureStore
from src.models.bkt import BKTModel
from src.models.akt import AKT
from src.models.risk_xgb import RiskModel
from src.models.rl_agent import LinUCB
from src.models.ncf import NCF


def get_next_learning_step(learner_id: int) -> Dict[str, Any]:
    """Central brain of DSARG_7 — orchestrates inference from all models.

    This function uses existing model classes for inference only (no retraining).
    It is intentionally simple and robust for demo purposes.
    """
    fs = FeatureStore()

    # 1. Load learner interactions (try int and string id variants)
    student_df = fs.get_student_df(learner_id)

    if student_df.empty:
        # try string form (some datasets store ids as strings)
        student_df = fs.interactions[fs.interactions["student_id"] == str(learner_id)].sort_values("timestamp").reset_index(drop=True)

    if student_df.empty:
        return {
            "concept": "intro",
            "activity": "video",
            "resource_id": "demo_welcome",
            "confidence": 0.25,
            "explanation": "No history — cold-start fallback",
        }

    # 2. Update BKT mastery from student's history
    bkt = BKTModel()
    # iterate in time order
    for _, row in student_df.iterrows():
        concept = row.get("concept_id")
        correct = bool(row.get("is_correct", False))
        try:
            bkt.update(learner_id, concept, correct)
        except Exception:
            # skip malformed rows
            continue

    # average mastery across seen concepts
    concepts_seen = student_df["concept_id"].unique()
    mastery_vals = [bkt.get_mastery(learner_id, c) for c in concepts_seen]
    avg_mastery = float(np.mean(mastery_vals)) if mastery_vals else 0.0

    # 3. Get a simple AKT-based embedding (use concept embedding of last item)
    all_concepts = pd.Categorical(fs.interactions["concept_id"]).categories
    num_concepts = max(1, len(all_concepts))
    akt = AKT(num_concepts=num_concepts)

    # map last concept to index
    last_concept = student_df["concept_id"].iloc[-1]
    try:
        last_idx = int(pd.Categorical(fs.interactions["concept_id"], categories=all_concepts).codes[student_df.index[-1]])
    except Exception:
        # fallback: use index of last concept in categories
        try:
            last_idx = int(list(all_concepts).index(last_concept))
        except Exception:
            last_idx = 0

    with torch.no_grad():
        try:
            emb = akt.concept_emb(torch.tensor([last_idx])).numpy().squeeze()
            akt_embedding = emb.tolist()
        except Exception:
            akt_embedding = [0.0] * 8

    # 4. Predict risk (try RiskModel, fallback to heuristic)
    agg = student_df.agg({"time_spent": "mean", "time_spent": "count", "is_correct": "mean"})
    X_row = pd.DataFrame([
        {
            "avg_time_spent": float(agg.get("time_spent", 0.0)),
            "total_interactions": int(agg.get("time_spent", 0)),
            "correct_rate": float(agg.get("is_correct", 0.0)),
        }
    ])

    risk_model = RiskModel()
    try:
        risk_score = float(risk_model.predict_proba(X_row))
    except Exception:
        # fallback heuristic: lower mastery -> higher risk
        risk_score = float(max(0.0, 1.0 - avg_mastery))

    # 5. Select next action (RL via LinUCB)
    context = np.array(
        [
            X_row["total_interactions"].iloc[0],
            X_row["avg_time_spent"].iloc[0],
            student_df["timestamp"].nunique(),
            float((student_df["timestamp"].diff().dt.days.max() or 0.0)),
            risk_score,
            avg_mastery,
        ],
        dtype=float,
    )

    n_actions = 5
    agent = LinUCB(n_actions=n_actions, context_dim=len(context))
    action_idx = agent.select_action(context)
    action_map = {
        0: ("practice", "easy"),
        1: ("practice", "medium"),
        2: ("practice", "hard"),
        3: ("video", "reinforce"),
        4: ("quiz", "mixed"),
    }
    activity, difficulty = action_map.get(action_idx, ("practice", "medium"))

    # 6. Recommend resource (NCF)
    # Prepare resource candidates
    df_all = fs.interactions.copy()
    df_all["resource_id"] = df_all["concept_id"].astype(str)
    df_all["student_code"] = df_all["student_id"].astype("category").cat.codes
    df_all["resource_code"] = df_all["resource_id"].astype("category").cat.codes

    user_code = int(df_all.loc[df_all["student_id"] == learner_id, "student_code"].iloc[0]) if (df_all["student_id"] == learner_id).any() else 0
    num_users = df_all["student_code"].nunique()
    num_items = df_all["resource_code"].nunique()

    ncf = NCF(num_users=max(1, num_users), num_items=max(1, num_items))
    # candidate items
    candidates = df_all[["resource_id", "resource_code"]].drop_duplicates().reset_index(drop=True)
    user_tensor = torch.tensor([user_code] * len(candidates), dtype=torch.long)
    item_tensor = torch.tensor(candidates["resource_code"].values, dtype=torch.long)

    try:
        with torch.no_grad():
            scores = ncf(user_tensor, item_tensor).squeeze().numpy()
        best_idx = int(np.argmax(scores))
        best_resource = candidates.loc[best_idx, "resource_id"]
        best_score = float(scores[best_idx])
    except Exception:
        # fallback: pick most recent concept
        best_resource = str(student_df["concept_id"].iloc[-1])
        best_score = 0.5

    confidence = float(0.7 * (1 - risk_score) + 0.3 * best_score)

    explanation = f"avg_mastery={avg_mastery:.2f}, risk={risk_score:.2f}, action={activity}/{difficulty}"

    return {
        "concept": str(last_concept),
        "activity": activity,
        "resource_id": best_resource,
        "confidence": confidence,
        "explanation": explanation,
    }


def record_interaction(learner_id, concept_id, correct, time_spent=0.0, activity_type="practice", difficulty="medium"):
    """Record an interaction and apply lightweight updates.

    Steps:
    1. Append interaction to FeatureStore (persisted parquet)
    2. Update BKT (one-step update)
    3. (AKT) By writing to FeatureStore, AKT can recompute from history on next inference
    4. Return a small summary
    """
    fs = FeatureStore()
    row = fs.record_interaction(
        student_id=learner_id,
        concept_id=concept_id,
        is_correct=bool(correct),
        time_spent=float(time_spent),
        activity_type=activity_type,
        difficulty=difficulty,
    )

    # One-step BKT update for quick feedback (get_next will recompute full mastery from history)
    try:
        bkt = BKTModel()
        new_mastery = bkt.update(learner_id, concept_id, bool(correct))
    except Exception:
        new_mastery = None

    return {"row": row, "new_mastery": new_mastery}
