#!/bin/sh 

bundler exec rails "blattwerkzeug:role:load_all" \
    "blattwerkzeug:user:load_all" \
    "blattwerkzeug:programming_language:load_all" \
    "blattwerkzeug:project:load_all" \
    "blattwerkzeug:news:load_all";

rails server -b 0.0.0.0 -p 9292; 