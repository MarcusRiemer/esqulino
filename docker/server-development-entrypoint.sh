#!/bin/sh

cd server

# Prepare the database (loading schema, creating databases.)
bundler exec rails "db:prepare"

# Load the seed data.
bundler exec rails "blattwerkzeug:role:load_all" \
    "blattwerkzeug:user:load_all" \
    "blattwerkzeug:programming_language:load_all" \
    "blattwerkzeug:project:load_all" \
    "blattwerkzeug:news:load_all";

# Give admin rights to guest user
bundler exec rails "blattwerkzeug:dev:make_guest_admin"

rails server -b 0.0.0.0;
