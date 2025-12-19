import argparse
import numpy as np
from collections import Counter
from src.models.rl_agent import LinUCB
from src.storage.feature_store import FeatureStore


def train_rl(epochs: int = 1, demo_size: int = 30, seed: int | None = 42):
    fs = FeatureStore()

    # Simulated state vector per student
    students = list(fs.interactions["student_id"].unique())

    context_dim = 6
    n_actions = 5

    agent = LinUCB(n_actions=n_actions, context_dim=context_dim)

    rng = np.random.RandomState(seed)

    # Track actions across all epochs
    actions_taken = []
    last_action = None

    # If too few students, we'll create a reproducible demo set later
    if len(students) < 2:
        students = None

    for ep in range(epochs):
        if students is None:
            # build reproducible demo student ids
            students = [f"demo_{i}" for i in range(demo_size)]

        for sid in students:
            features = fs.compute_engagement_features(sid)
            # If original FeatureStore has no data for demo ids, compute_engagement_features will return None
            if features is None:
                # create a synthetic feature vector for demo students
                features = {
                    "total_interactions": int(rng.randint(1, 50)),
                    "avg_time_spent": float(rng.uniform(0.5, 10.0)),
                    "active_days": int(rng.randint(1, 30)),
                    "max_inactivity_gap": float(rng.uniform(0.0, 10.0)),
                }

            context = np.array([
                features["total_interactions"],
                features["avg_time_spent"],
                features["active_days"],
                features["max_inactivity_gap"] if features["max_inactivity_gap"] is not None else 0.0,
                rng.rand(),  # risk score placeholder
                rng.rand(),  # avg mastery placeholder
            ], dtype=float)

            action = agent.select_action(context)
            last_action = action
            actions_taken.append(action)

            # Simulated reward (hackathon-safe)
            mastery_gain = rng.uniform(0, 1)
            engagement_gain = rng.uniform(0, 1)
            risk_change = rng.uniform(-0.5, 0.5)

            reward = mastery_gain + 0.5 * engagement_gain - risk_change

            agent.update(action, context, reward)

    print("RL agent training complete")
    print("Sample selected action:", last_action)
    print("Action distribution:", Counter(actions_taken))

    return agent


def _cli():
    p = argparse.ArgumentParser()
    p.add_argument("--epochs", type=int, default=1, help="Number of epochs over students")
    p.add_argument("--demo-size", type=int, default=30, help="Synthetic demo student count when data is small")
    p.add_argument("--seed", type=int, default=42, help="RNG seed for reproducibility")
    args = p.parse_args()

    train_rl(epochs=args.epochs, demo_size=args.demo_size, seed=args.seed)


if __name__ == "__main__":
    _cli()
