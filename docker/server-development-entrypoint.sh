#!/bin/sh 

# Setup the databse schema. 
bundler exec rails "db:setup"

# Seed the database
bundler exec rails "blattwerkzeug:role:load_all" \
    "blattwerkzeug:user:load_all" \
    "blattwerkzeug:programming_language:load_all" \
    "blattwerkzeug:project:load_all" \
    "blattwerkzeug:news:load_all";

# Give admin rights to the guest user (should be already save in the database)
bundler exec rails "blattwerkzeug:dev:make_guest_admin"

# Start the rails server on port 9292
rails server -b 0.0.0.0 -p 9292; 