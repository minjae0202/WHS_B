"""Flask와 데이터베이스 연결을 함께 확인하는 컨테이너 헬스체크."""
import sys
import urllib.error
import urllib.request

try:
    with urllib.request.urlopen(
        "http://127.0.0.1:5000/api/health",
        timeout=3,
    ) as response:
        if response.status != 200:
            sys.exit(1)
except urllib.error.HTTPError:
    sys.exit(1)
except Exception:
    sys.exit(1)
sys.exit(0)
