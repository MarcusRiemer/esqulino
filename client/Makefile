# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

NG_BIN = node_modules/.bin/ng
NGC_BIN = node_modules/.bin/ngc
TS_NODE_BIN = node_modules/.bin/ts-node

BUNDLE_FILES = $(shell find dist/ -iname "*bundle*.js" 2> /dev/null)
BUNDLE_FILES_GZIP = $(addsuffix .gz, $(BUNDLE_FILES))

all : dist

clean : msg-pre-clean
	rm -rf dist

dist : msg-pre-build
	$(NG_BIN) build --prod $(NG_OPTS)

dist-dev : msg-pre-build
	$(NG_BIN) build $(NG_OPTS)

install-deps : has-npm msg-pre-install-deps
	npm install

test :
	$(NG_BIN) test

clean-deps : msg-pre-clean-deps
	rm -rf "node_modules"

##################################
# Universal Rendering
##################################

universal-compile:
	$(NG_BIN) build --prod
	$(NGC_BIN)

universal-run:
	$(TS_NODE_BIN) src/server.ts

%.gz : %
	gzip --keep $^

gzipped-bundles : $(BUNDLE_FILES_GZIP)

gzipped-clean :
	rm -f $(BUNDLE_FILES_GZIP)

##################################
# Messaging targets
##################################

msg-pre-build :
	@echo "## Client : Compiling ..."

msg-pre-clean :
	@echo "## Client : Cleaning ..."

msg-pre-clean-deps :
	@echo "## Client : Cleaning dependencies ..."

msg-pre-install-deps :
	@echo "## Client : Installing dependencies ..."

.PHONY : all clean dist dist-dev msg-pre-build video-stills
