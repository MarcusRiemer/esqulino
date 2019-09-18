IN_FILES = $(shell find . -iname '*.md' 2> /dev/null)
PDF_FILES= $(IN_FILES:.md=.pdf)
HTML_FILES= $(IN_FILES:.md=.html)

KRAMDOWN_BIN ?= /home/marcus/.gem/ruby/2.6.0/bin/kramdown

all : $(PDF_FILES) $(HTML_FILES)

%.html : %.md
	$(KRAMDOWN_BIN) $^ > $@

%.pdf : %.md
	$(KRAMDOWN_BIN) -o pdf $^ > $@