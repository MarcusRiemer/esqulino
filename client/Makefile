# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

NG_BIN = node_modules/@angular/cli/bin/ng

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
