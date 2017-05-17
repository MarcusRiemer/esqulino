# This Makefile used to be a complex behemont, but now simply wraps
# the Angular CLI

include ../Makefile.common

NG_BIN = node_modules/@angular/cli/bin/ng

VIDEO_FILES_MP4 = $(shell find src/vendor/videos/ -iname "*.mp4")
VIDEO_STILLS =  $(VIDEO_FILES_MP4:%.mp4=%.jpg)

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
# Video conversion for examples
##################################

debug :
	@echo $(VIDEO_STILLS)

video-stills : $(VIDEO_STILLS)

%.jpg : %.mp4
	ffmpeg -i $^ -vframes 1 $@

##################################
# Messaging targets
##################################

msg-pre-build :
	@tput setaf 2; echo "## Client : Compiling ..."; tput sgr0

msg-pre-clean :
	@tput setaf 2; echo "## Client : Cleaning ..."; tput sgr0

msg-pre-clean-deps :
	@tput setaf 2; echo "## Client : Cleaning dependencies ..."; tput sgr0

msg-pre-install-deps :
	@tput setaf 2; echo "## Client : Installing dependencies ..."; tput sgr0

.PHONY : all clean dist dist-dev msg-pre-build video-stills
