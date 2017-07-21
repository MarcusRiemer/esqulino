#!/bin/sh
export TEST_SINGLE_RUN=true

make install-deps
make -C client dist-dev
make -C server test
make -C client test
