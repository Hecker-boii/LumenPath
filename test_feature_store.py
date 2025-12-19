#!/usr/bin/env python
import sys
import os

os.chdir("C:\\Users\\Vijay 473\\OneDrive\\Desktop\\dsarg_7")
sys.path.insert(0, os.getcwd())

try:
    from src.storage.feature_store import FeatureStore
    
    fs = FeatureStore()
    sample_student = fs.interactions['student_id'].iloc[0]
    features = fs.compute_basic_features(sample_student)
    
    print("✅ FeatureStore loaded successfully")
    print(f"Sample Student ID: {sample_student}")
    print(f"Features: {features}")
    
    with open("data/processed/feature_store_test.txt", "w") as f:
        f.write(f"Sample Student ID: {sample_student}\n")
        f.write(f"Features:\n{features}\n")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
