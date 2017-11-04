#!/bin/sh
export TEST_SINGLE_RUN=true

groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

su user -c "make --no-print-directory install-deps"
su user -c "make --no-print-directory -C client dist-dev"
su user -c "make --no-print-directory -C server test"
su user -c "make --no-print-directory -C client test"
