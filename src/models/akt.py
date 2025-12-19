import torch
import torch.nn as nn


class AKT(nn.Module):
    def __init__(
        self,
        num_concepts,
        embedding_dim=64,
        num_heads=4,
        dropout=0.1,
    ):
        super().__init__()

        self.concept_emb = nn.Embedding(num_concepts, embedding_dim)
        self.response_emb = nn.Embedding(2, embedding_dim)
        self.mastery_proj = nn.Linear(1, embedding_dim)

        self.attention = nn.MultiheadAttention(
            embed_dim=embedding_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True,
        )

        self.fc = nn.Linear(embedding_dim, 1)

    def forward(self, concept_ids, responses, mastery_probs):
        """
        concept_ids: [B, T]
        responses:   [B, T] (0/1)
        mastery:     [B, T, 1]
        """

        c_emb = self.concept_emb(concept_ids)
        r_emb = self.response_emb(responses)
        m_emb = self.mastery_proj(mastery_probs)

        x = c_emb + r_emb + m_emb

        attn_out, _ = self.attention(x, x, x)
        logits = self.fc(attn_out)

        return torch.sigmoid(logits)
