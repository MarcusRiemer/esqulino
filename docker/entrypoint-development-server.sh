#!/bin/sh

# Run all operations using the uid and gid of the host user
groupadd -g "$USER_GID" user
useradd -m -u "$USER_UID" -g "$USER_GID" user

# Ensure that the projects folder has the correct rights and exists
chown user:user -R /srv/project-data
su user -c "mkdir -p /srv/project-data/projects"

# Run everything from here in the server folder
cd server

# Install server dependencies
su user -c "make install-deps"

# Possibly populate the database
su user -c "./bin/rails db:exists || make setup-database-schema load-live-data"

# And actually run the server
su user -c "make run-dev"