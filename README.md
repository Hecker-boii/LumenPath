🚀 DSARG_7 — Personalized Learning AI Agent
🔍 Problem Statement

Traditional education platforms fail to:

Personalize learning paths at scale

Detect struggling students early

Adapt curriculum dynamically

Explain decisions to teachers

Address equity and bias

DSARG_7 solves this using AI-driven learner modeling and curriculum orchestration.

🎯 What This System Does

✔ Tracks learner progress
✔ Models student knowledge over time
✔ Predicts learning risk early
✔ Adapts curriculum dynamically
✔ Recommends best learning resources
✔ Provides explanations for decisions
✔ Supports teachers with actionable insights

🧠 AI MODELS USED (NO RULES)
Component	Model
Short-term mastery	Bayesian Knowledge Tracing
Long-term learner model	AKT (Attentive Knowledge Tracing)
Risk prediction	XGBoost
Curriculum adaptation	Contextual Reinforcement Learning
Resource recommendation	Neural Collaborative Filtering
Explainability	SHAP
Fairness monitoring	Statistical parity checks
🔄 SYSTEM WORKFLOW
Student Interaction
     ↓
Short-Term Knowledge Tracking (BKT)
     ↓
Long-Term Learner Representation (AKT)
     ↓
Risk Prediction (XGBoost + SHAP)
     ↓
Curriculum Adaptation Agent (RL)
     ↓
Resource Recommendation (NCF)
     ↓
Next Learning Activity + Explanation

📘 STEP-BY-STEP IMPLEMENTATION GUIDE
STEP 1: DATASET SETUP
Datasets Used

EdNet (Knowledge tracing)

Open University Learning Analytics Dataset (Dropout prediction)

Student Performance Dataset

📁 Location:

data/raw/

What to Do

Download datasets

Place in correct folders

Do NOT modify raw data

STEP 2: DATA PREPROCESSING

📂 src/data_processing/

What happens:

Clean missing values

Normalize scores

Encode categorical variables

Create time-based sequences

Output:

data/processed/

STEP 3: KNOWLEDGE MODELING

📂 src/models/knowledge_tracing/

Models:

bkt.py → short-term mastery

akt.py → long-term learner embedding

Why:

BKT reacts fast

AKT understands learning over time

STEP 4: RISK PREDICTION

📂 src/models/risk_prediction/

Model:

XGBoost

Predicts:

Failure probability

Dropout risk

Engagement decline

Explainability:

SHAP shows which behaviors caused risk

STEP 5: CURRICULUM ADAPTATION (CORE USP)

📂 src/models/curriculum_agent/

Model:

Contextual Reinforcement Learning

State:

Learner embedding

Mastery levels

Risk score

Action:

Choose next concept

Choose difficulty

Choose activity type

Reward:

Mastery improvement

Risk reduction

Engagement increase

STEP 6: RESOURCE RECOMMENDATION

📂 src/models/recommendation/

Model:

Neural Collaborative Filtering

Solves:

Information overload

Cold-start problem

Output:

Ranked resources with scores

STEP 7: LEARNING ORCHESTRATION

📂 src/orchestration/

This is the brain of DSARG_7

What it does:

Combines all model outputs

Ensures fairness constraints

Produces final decision

STEP 8: API LAYER

📂 api/

Provides:

Student dashboard data

Teacher alerts

Risk explanations

Recommended next activity

STEP 9: DEMO & TESTING

📂 demo/

Sample students

Sample resources

End-to-end pipeline run

⚖️ FAIRNESS & ETHICS

📂 src/utils/fairness_checks.py

Monitors:

Risk score bias

Recommendation exposure

Performance gaps

Alerts teacher/admin if bias detected.

🏆 WHY THIS PROJECT IS STRONG

✔ Solves real educational pain
✔ Uses real AI models
✔ Explainable & ethical
✔ Generalizable across subjects
✔ Hackathon-ready
✔ Research-aligned
