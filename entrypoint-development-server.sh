#!/bin/sh

# Run all operations using the uid and gid of the host user
groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

make -C server install-deps

su user -c "make --no-print-directory -C client cli-compile"
su user -c "make --no-print-directory -C server setup-database-schema run-dev"
