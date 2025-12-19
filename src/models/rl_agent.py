import numpy as np


class LinUCB:
    def __init__(self, n_actions, context_dim, alpha=1.0):
        self.n_actions = n_actions
        self.context_dim = context_dim
        self.alpha = alpha

        self.A = [np.identity(context_dim) for _ in range(n_actions)]
        self.b = [np.zeros((context_dim, 1)) for _ in range(n_actions)]

    def select_action(self, context):
        context = context.reshape(-1, 1)
        scores = []

        for a in range(self.n_actions):
            A_inv = np.linalg.inv(self.A[a])
            theta = A_inv @ self.b[a]
            p = (
                theta.T @ context
                + self.alpha * np.sqrt(context.T @ A_inv @ context)
            )
            scores.append(float(p.item()))

        return int(np.argmax(scores))

    def update(self, action, context, reward):
        context = context.reshape(-1, 1)
        self.A[action] += context @ context.T
        self.b[action] += reward * context
