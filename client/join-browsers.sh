#!/bin/bash

# This script is a horrible hack to generate a properly
# comma separated list of browsers from two possibly unrelated
# environment variables

# https://stackoverflow.com/a/17841619/431715
function join_by {
    local IFS="$1";
    shift;
    echo "$*";
}

join_by , $*