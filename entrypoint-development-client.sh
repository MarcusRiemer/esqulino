#!/bin/sh

groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

su user -c "make -C client clean-deps"
su user -c "make -C client install-deps"
NG_OPTS="--watch" su user -c "make -C --no-print-directory client dist-dev"
