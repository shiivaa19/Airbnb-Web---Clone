import os
import sys

# Add the current directory to sys.path so 'app' module can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
