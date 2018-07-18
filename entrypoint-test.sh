#!/bin/sh
export TEST_SINGLE_RUN=true

# Run all operations using the uid and gid of the host user
groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

# TODO: Remove PKG_CONFIG_PATH once rmagick works with imagemagick 7
su user -c "PKG_CONFIG_PATH=/usr/lib/imagemagick6/pkgconfig make --no-print-directory install-deps"
su user -c "make --no-print-directory -C client dist-dev"
su user -c "make --no-print-directory -C server test"
su user -c "make --no-print-directory -C client client-test"
