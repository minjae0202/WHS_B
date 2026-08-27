#!/bin/sh
set -e

# DB 마이그레이션: 앱/스케줄러가 뜨기 전에 스키마를 최신으로 맞춘다.
# RUN_DB_UPGRADE=0 으로 두면 건너뜀 (여러 컨테이너가 동시에 upgrade 하는 걸 피하고
# 싶을 때, 예: 스케줄러 컨테이너).
if [ "${RUN_DB_UPGRADE:-1}" = "1" ]; then
  echo "[entrypoint] flask db upgrade ..."
  flask db upgrade
else
  echo "[entrypoint] RUN_DB_UPGRADE=0 -> skip db upgrade"
fi

exec "$@"
