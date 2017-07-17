#!/bin/sh
git clone https://bitbucket.org/marcusriemer/esqulino.git --depth 1 .
make install-deps dist
make -C server test
make -C client test
