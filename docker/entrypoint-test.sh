#!/bin/sh
export TEST_SINGLE_RUN=true
export NG_CLI_ANALYTICS=ci # Stop Angular CLI from asking for usage statistics

# Run all operations using the uid and gid of the host user
groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

# Ensure that the projects folder has the correct rights and exists
chown user:user -R /srv/project-data
su user -c "mkdir -p /srv/project-data/projects"

su user -c "make --no-print-directory install-deps"
su user -c "make --no-print-directory -C client client-compile-de universal-de cli-compile"
su user -c "make --no-print-directory -C client client-test"
su user -c "make --no-print-directory -C server setup-database-schema test"
su user -c "make --no-print-directory -C server load-live-data"
