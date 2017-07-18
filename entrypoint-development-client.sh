#!/bin/sh

make -C client clean-deps
make -C client install-deps
NG_OPTS="--watch" make -C client dist-dev
