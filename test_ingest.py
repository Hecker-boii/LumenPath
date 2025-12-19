#!/usr/bin/env python
import sys
import os

# Ensure we're in project root
os.chdir("C:\\Users\\Vijay 473\\OneDrive\\Desktop\\dsarg_7")
sys.path.insert(0, os.getcwd())

# Now run the ingestion
import scripts.ingest_oulad as ingest_module

# Log to file as well
with open("data/processed/ingestion_log.txt", "w") as log:
    import io
    from contextlib import redirect_stdout, redirect_stderr
    
    f = io.StringIO()
    try:
        with redirect_stdout(f), redirect_stderr(f):
            ingest_module.main()
    except Exception as e:
        print(f"ERROR: {e}", file=log)
        import traceback
        traceback.print_exc(file=log)
    
    output = f.getvalue()
    log.write(output)
    print(output)

print("Check data/processed/ingestion_log.txt for details")
