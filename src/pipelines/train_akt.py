import torch
from torch.utils.data import Dataset, DataLoader
from src.models.akt import AKT
from src.storage.feature_store import FeatureStore


class AKTDataset(Dataset):
    def __init__(self, interactions):
        self.data = interactions

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        return (
            torch.tensor([int(row["concept_id_encoded"])], dtype=torch.long),
            torch.tensor([int(row["is_correct"])], dtype=torch.long),
            torch.tensor([[float(row["mastery"])]], dtype=torch.float),
        )


def train_akt():
    fs = FeatureStore()
    df = fs.interactions.copy()

    # Encode concepts
    df["concept_id_encoded"] = (
        df["concept_id"].astype("category").cat.codes
    )

    # Add BKT mastery
    df["mastery"] = 0.5  # placeholder (we'll replace with real BKT log next step)

    dataset = AKTDataset(df)
    loader = DataLoader(dataset, batch_size=32)

    model = AKT(num_concepts=df["concept_id_encoded"].nunique())
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = torch.nn.BCELoss()

    for epoch in range(3):
        total_loss = 0
        for c, r, m in loader:
            pred = model(c, r, m)
            loss = loss_fn(pred.squeeze().float(), r.squeeze().float())

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}")

    torch.save(model.state_dict(), "models/akt.pt")
    print("AKT training complete")


if __name__ == "__main__":
    train_akt()
