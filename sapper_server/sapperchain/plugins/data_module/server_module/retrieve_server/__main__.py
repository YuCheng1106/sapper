import sys
project_root = "E:\public_tech_lib"  # 根据实际结构调整
sys.path.append(str(project_root))
from server import main
sys.exit(main())
