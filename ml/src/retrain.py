"""Retrain and keep a timestamped rollback copy of the previous model."""
from pathlib import Path
from datetime import datetime
import shutil
from train import train, OUTPUT


if __name__ == "__main__":
    backup = OUTPUT.with_name(f"service-category-{datetime.now():%Y%m%d%H%M%S}.joblib")
    if OUTPUT.exists(): shutil.copy2(OUTPUT, backup)
    print(f"model exported to {train()}; rollback copy: {backup if backup.exists() else 'none'}")
