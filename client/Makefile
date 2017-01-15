# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

NG_BIN = node_modules/angular-cli/bin/ng

all : dist

clean : msg-pre-clean
	rm -rf dist

dist : msg-pre-build
	$(NG_BIN) build --prod $(NG_OPTS)

dist-dev : msg-pre-build
	$(NG_BIN) build $(NG_OPTS)

##################################
# Messaging targets
##################################

msg-pre-build :
	@tput setaf 2; echo "## Client : Compiling ..."; tput sgr0

msg-pre-clean :
	@tput setaf 2; echo "## Client : Cleaning ..."; tput sgr0

.PHONY : all clean dist dist-dev msg-pre-build
