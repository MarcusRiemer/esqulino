#!/bin/sh

case "$TYPE" in
CLIENT)
  make -C client install-deps
  NG_OPTS="--watch" make -C client dist-dev
;;
SERVER)
  export GEM_PATH=/srv/esqulino/server/vendor/bundle/ruby/2.4.0
  make -C server install-deps
  make -C server run-dev
;;
SLEEP)
  while true
  do
    sleep 3600
  done
;;
*)
  echo "ERROR: '$TYPE' is not valid for TYPE" >&2
  echo "valid Types are: CLIENT, SERVER, SLEEP" >&2
  exit 1
;;
esac
