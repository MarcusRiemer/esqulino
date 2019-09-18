#!/bin/sh
export TEST_SINGLE_RUN=true
export NG_CLI_ANALYTICS=ci # Stop Angular CLI from asking for usage statistics

mkdir -p /srv/project-data/projects

make --no-print-directory install-deps
make --no-print-directory -C client cli-compile
make --no-print-directory -C client client-compile-de
make --no-print-directory -C client universal-de
make --no-print-directory -C client client-test
make --no-print-directory -C server setup-database-schema test
make --no-print-directory -C server load-live-data
