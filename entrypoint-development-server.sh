#!/bin/sh

groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

export GEM_PATH=/srv/esqulino/server/vendor/bundle/ruby/2.4.0
make -C server install-deps
su user -c "make --no-print-directory -C server run-dev"
