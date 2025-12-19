from fastapi import FastAPI
from fastapi import Body

from src.api.orchestrator import get_next_learning_step, record_interaction

app = FastAPI(title="DSARG API")


@app.get("/learner/{learner_id}/next")
def next_step(learner_id: int):
    return get_next_learning_step(learner_id)


@app.post("/learner/{learner_id}/interact")
def interact(learner_id: int, payload: dict = Body(...)):
    record_interaction(
        learner_id=learner_id,
        concept_id=payload["concept_id"],
        correct=payload["correct"],
        time_spent=payload.get("time_spent", 0),
        
    )
    return {"status": "interaction recorded"}
