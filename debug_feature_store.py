import pandas as pd
import sys
import os

os.chdir("C:\\Users\\Vijay 473\\OneDrive\\Desktop\\dsarg_7")

try:
    # Step 1: Load parquet
    print("Loading interactions.parquet...")
    interactions = pd.read_parquet("data/processed/interactions.parquet")
    print(f"✓ Loaded {len(interactions)} rows")
    print(f"Columns: {list(interactions.columns)}")
    print(f"First row:\n{interactions.iloc[0]}")
    
    # Step 2: Test FeatureStore
    print("\n" + "="*50)
    print("Testing FeatureStore...")
    sys.path.insert(0, os.getcwd())
    from src.storage.feature_store import FeatureStore
    
    fs = FeatureStore()
    print(f"✓ FeatureStore initialized with {len(fs.interactions)} rows")
    
    sample_student = fs.interactions['student_id'].iloc[0]
    print(f"Sample student: {sample_student}")
    
    features = fs.compute_basic_features(sample_student)
    print(f"\n✓ Features computed:")
    for key, value in features.items():
        print(f"  {key}: {value}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
