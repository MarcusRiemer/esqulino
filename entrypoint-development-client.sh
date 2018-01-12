#!/bin/sh

# Run all operations using the uid and gid of the host user
groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

su user -c "make -C client clean-deps"
su user -c "make -C client install-deps"
NG_OPTS="--watch" su user -c "make --no-print-directory  -C client dist-dev"
