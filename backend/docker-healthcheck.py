"""컨테이너 헬스체크.

Flask 앱이 HTTP 응답을 돌려주면(경로가 없어 404 JSON이어도) 프로세스는 살아있는
것이므로 정상(0)으로 본다. 연결 자체가 실패하면 비정상(1).
"""
import sys
import urllib.error
import urllib.request

try:
    urllib.request.urlopen("http://127.0.0.1:5000/", timeout=3)
except urllib.error.HTTPError:
    sys.exit(0)
except Exception:
    sys.exit(1)
sys.exit(0)
