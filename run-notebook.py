"""
ABACO Financial Intelligence Platform - Notebook Execution Script
Following AI Toolkit best practices for financial data analysis
"""

import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
import logging

# Setup logging following AI Toolkit best practices
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AbacoNotebookRunner")

def run_notebook_with_jupyter(notebook_path: str) -> bool:
    """
    Execute Jupyter notebook properly using nbconvert
    Following AI Toolkit best practices for notebook execution
    """
    try:
        trace_id = f"notebook_exec_{int(datetime.now().timestamp())}"
        
        logger.info(f"🔍 [AI Toolkit Trace] Starting notebook execution", extra={
            'trace_id': trace_id,
            'notebook_path': notebook_path,
            'platform': 'abaco_financial_intelligence',
            'operation': 'notebook_execution'
        })
        
        # Check if notebook exists
        if not Path(notebook_path).exists():
            logger.error(f"❌ Notebook not found: {notebook_path}")
            return False
            
        # Install required packages if not available
        required_packages = ['jupyter', 'nbconvert', 'pandas', 'numpy']
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                logger.info(f"📦 Installing missing package: {package}")
                subprocess.run([sys.executable, '-m', 'pip', 'install', package], 
                             check=True, capture_output=True)
        
        # Execute notebook using nbconvert
        cmd = [
            sys.executable, '-m', 'jupyter', 'nbconvert',
            '--to', 'notebook',
            '--execute',
            '--inplace',
            notebook_path
        ]
        
        logger.info(f"🚀 Executing notebook: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        logger.info(f"✅ [AI Toolkit Trace] Notebook execution completed", extra={
            'trace_id': trace_id,
            'notebook_path': notebook_path,
            'platform': 'abaco_financial_intelligence',
            'operation': 'notebook_execution_complete',
            'success': True
        })
        
        print(f"✅ Notebook executed successfully: {notebook_path}")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ [AI Toolkit Trace] Notebook execution failed", extra={
            'trace_id': trace_id,
            'notebook_path': notebook_path,
            'platform': 'abaco_financial_intelligence',
            'operation': 'notebook_execution_error',
            'error': str(e),
            'stdout': e.stdout,
            'stderr': e.stderr
        })
        
        print(f"❌ Notebook execution failed: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False
        
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        return False

def main():
    """Main execution function"""
    print("🏦 ABACO Financial Intelligence Platform - Notebook Runner")
    print("=" * 60)
    
    if len(sys.argv) != 2:
        print("Usage: python run-notebook.py <notebook_path>")
        print("Example: python run-notebook.py notebooks/abaco_financial_intelligence_production.ipynb")
        sys.exit(1)
    
    notebook_path = sys.argv[1]
    
    print(f"📓 Executing notebook: {notebook_path}")
    print(f"🕐 Start time: {datetime.now().isoformat()}")
    
    success = run_notebook_with_jupyter(notebook_path)
    
    if success:
        print("🎉 Notebook execution completed successfully!")
        print("📊 Check the data/reports/ directory for generated files")
        sys.exit(0)
    else:
        print("❌ Notebook execution failed!")
        print("💡 Try running: jupyter notebook <notebook_path> manually")
        sys.exit(1)

if __name__ == "__main__":
    main()
