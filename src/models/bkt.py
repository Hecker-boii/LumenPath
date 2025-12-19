import numpy as np
from collections import defaultdict


class BKTModel:
    def __init__(
        self,
        p_init=0.2,
        p_learn=0.15,
        p_guess=0.2,
        p_slip=0.1,
    ):
        """
        p_init  : Initial probability student knows a concept
        p_learn : Probability of learning after an interaction
        p_guess : Probability of guessing correctly
        p_slip  : Probability of slipping despite knowing
        """
        self.p_init = p_init
        self.p_learn = p_learn
        self.p_guess = p_guess
        self.p_slip = p_slip

        self.mastery = defaultdict(lambda: self.p_init)

    def update(self, student_id, concept_id, correct):
        """
        Update mastery probability using Bayes rule
        """
        key = (student_id, concept_id)
        p_known = self.mastery[key]

        if correct:
            numerator = p_known * (1 - self.p_slip)
            denominator = numerator + (1 - p_known) * self.p_guess
        else:
            numerator = p_known * self.p_slip
            denominator = numerator + (1 - p_known) * (1 - self.p_guess)

        posterior = numerator / denominator

        # Learning transition
        posterior = posterior + (1 - posterior) * self.p_learn

        self.mastery[key] = posterior
        return posterior

    def get_mastery(self, student_id, concept_id):
        return self.mastery[(student_id, concept_id)]
