#!/bin/sh

cat /etc/hosts

export GEM_PATH=/srv/esqulino/server/vendor/bundle/ruby/2.4.0
make -C server install-deps
make -C server run-dev
