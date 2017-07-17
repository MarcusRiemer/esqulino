# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

NG_BIN = node_modules/.bin/ng
NGC_BIN = node_modules/.bin/ngc
TS_NODE_BIN = node_modules/.bin/ts-node

BUNDLE_FILES = $(shell find dist/ -iname "*bundle*.js" 2> /dev/null)
BUNDLE_FILES_GZIP = $(addsuffix .gz, $(BUNDLE_FILES))

TEST_SINGLE_RUN ?= true
TEST_BROWSERS   ?= ChromeHeadless

all : dist

clean : msg-pre-clean
	rm -rf dist

dist : msg-pre-build
	$(NG_BIN) build --prod $(NG_OPTS)
	$(NGC_BIN)

dist-dev : msg-pre-build
	$(NG_BIN) build $(NG_OPTS)

install-deps : has-npm msg-pre-install-deps
	npm install

test :
	$(NG_BIN) test --single-run $(TEST_SINGLE_RUN) --browser $(TEST_BROWSERS) --code-coverage true

clean-deps : msg-pre-clean-deps
	rm -rf "node_modules"

##################################
# Universal Rendering
##################################

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
	-@tput setaf 2; echo "## Client : Compiling ..."; tput sgr0

msg-pre-clean :
	-@tput setaf 2; echo "## Client : Cleaning ..."; tput sgr0

msg-pre-clean-deps :
	-@tput setaf 2; echo "## Client : Cleaning dependencies ..."; tput sgr0

msg-pre-install-deps :
	-@tput setaf 2; echo "## Client : Installing dependencies ..."; tput sgr0

.PHONY : all clean dist dist-dev msg-pre-build video-stills
