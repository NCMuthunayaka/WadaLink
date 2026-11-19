import sys
from pathlib import Path

# Add backend directory to sys.path so app imports work seamlessly
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
