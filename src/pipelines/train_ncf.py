import torch
from torch.utils.data import DataLoader, Dataset
from src.models.ncf import NCF
from src.storage.feature_store import FeatureStore


class InteractionDataset(Dataset):
    def __init__(self, df):
        # encoded ids expected as integer codes
        self.users = df["student_id_encoded"].astype(int).values
        self.items = df["resource_id_encoded"].astype(int).values
        self.labels = df["is_correct"].astype(float).values

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.users[idx], dtype=torch.long),
            torch.tensor(self.items[idx], dtype=torch.long),
            torch.tensor(self.labels[idx], dtype=torch.float),
        )


def train_ncf():
    fs = FeatureStore()
    df = fs.interactions.copy()

    if df.empty:
        print("[WARN] No interaction data found — skipping NCF training.")
        return None

    # Demo-safe resource IDs
    df["resource_id"] = df["concept_id"].astype(str)

    df["student_id_encoded"] = df["student_id"].astype("category").cat.codes
    df["resource_id_encoded"] = df["resource_id"].astype("category").cat.codes

    dataset = InteractionDataset(df)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    num_users = df["student_id_encoded"].nunique()
    num_items = df["resource_id_encoded"].nunique()

    model = NCF(num_users=num_users, num_items=num_items)

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = torch.nn.BCELoss()

    for epoch in range(3):
        total_loss = 0.0
        for u, i, y in loader:
            # ensure tensors are on correct dtype
            u = u.long()
            i = i.long()
            y = y.float()

            pred = model(u, i).squeeze()
            loss = loss_fn(pred, y)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}")

    print("NCF training complete")

    return model


if __name__ == "__main__":
    train_ncf()
