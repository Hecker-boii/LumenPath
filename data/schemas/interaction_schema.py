from dataclasses import dataclass
from datetime import datetime

@dataclass
class InteractionEvent:
    student_id: str
    timestamp: datetime
    activity_id: str
    concept_id: str
    is_correct: int
    attempts: int
    time_spent: float
    activity_type: str
    difficulty: float
