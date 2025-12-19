from src.storage.feature_store import FeatureStore
fs = FeatureStore()
df = fs.interactions.groupby('student_id').agg(
    avg_time_spent=('time_spent','mean'),
    total_interactions=('time_spent','count'),
    correct_rate=('is_correct','mean'),
).reset_index()
print(df.head())
print('at_risk unique:', ((df['correct_rate']<0.6).astype(int)).unique())
print('correct_rate min/max', df['correct_rate'].min(), df['correct_rate'].max())
print('dtypes:', df.dtypes)
