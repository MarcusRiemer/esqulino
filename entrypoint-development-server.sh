#!/bin/sh

# Run all operations using the uid and gid of the host user
groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

export GEM_PATH=/srv/esqulino/server/vendor/bundle/ruby/2.5.0

# TODO: Remove PKG_CONFIG_PATH once rmagick works with imagemagick 7
PKG_CONFIG_PATH=/usr/lib/imagemagick6/pkgconfig make -C server install-deps
su user -c "make --no-print-directory -C server run-dev"
