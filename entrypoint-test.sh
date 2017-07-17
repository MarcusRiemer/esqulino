#!/bin/sh
git clone https://bitbucket.org/marcusriemer/esqulino.git --depth 1 .
make install-deps dist
make -C server test
TEST_SINGLE_RUN=true make -C client test
