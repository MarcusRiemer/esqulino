INKSCAPE = "/Applications/Inkscape.app/Contents/Resources/bin/Inkscape"

TEX_FILES = $(shell find . -type f -iname "*.tex")
SVG_FILES = $(shell find . -type f -iname "*.svg")
SVG_PDF_FILES = $(shell find ./gfx -type f -iname "*.svg" | sed -e 's/.svg/.pdf/g')
GRAPH_PDF_FILES = $(shell find ./gfx -type f -iname "*.json" | sed -e 's/.json/.graphviz.pdf/g')
CURR_GIT_REV = $(shell git log --pretty=format:"%h %ai" -1 HEAD | tr -d '\n')

PDF_FILENAME = build/thesis.pdf
PDF_FILENAME_TWOSIDE = build/thesis-twoside.pdf

CLI_PROG_CLIENT = ../../../client/dist/cli/main.cli.js

all : $(PDF_FILENAME) $(PDF_FILENAME_TWOSIDE)
thesis : $(PDF_FILENAME)
twoside : $(PDF_FILENAME_TWOSIDE)

#################################
# Document generation
#################################

GIT_REV :
	echo $(CURR_GIT_REV) > GIT_REV

thesis-update: msg-pre-pdf $(TEX_FILES) $(SVG_PDF_FILES) $(GRAPH_PDF_FILES)
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis

$(PDF_FILENAME) : clean msg-pre-pdf $(TEX_FILES) $(SVG_PDF_FILES) $(GRAPH_PDF_FILES) GIT_REV
	mkdir -p build
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis
	cp bib-refs.bib build
	cd build; bibtex thesis
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis

$(PDF_FILENAME_TWOSIDE) : msg-pre-pdf-twoside $(TEX_FILES) $(SVG_PDF_FILES) $(GRAPH_PDF_FILES) GIT_REV
	mkdir -p build
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis-twoside
	cp bib-refs.bib build
	cd build; bibtex thesis-twoside
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis-twoside
	xelatex -synctex=1 -shell-escape -file-line-error -output-directory=build thesis-twoside

graphs: $(GRAPHVIZ_FILES)

svgs: $(SVG_FILES)

%.graphviz : %.json
		@echo '{ "type": "graphvizTree", "model": $(shell cat $< | jq -c .)}' | node $(CLI_PROG_CLIENT) | jq -r . | tee $@
		sed -i '' 's/Verdana/Dax Pro/' $@

%.graphviz.pdf : %.graphviz
	dot -Tpdf $< -o $@

%.pdf : %.svg
	$(INKSCAPE) "$(shell pwd)/$<" -A="$(shell pwd)/$@" --without-gui

clean : msg-pre-clean
	rm -rf build GIT_REV

##################################
# Message targets
##################################
msg-pre-clean :
	-@tput setaf 2; echo "## Thesis : Cleaning"; tput sgr0

msg-pre-pdf :
	-@tput setaf 2; echo "## Thesis : Generating PDF"; tput sgr0

msg-pre-pdf-twoside :
	-@tput setaf 2; echo "## Thesis : Generating PDF Twoside"; tput sgr0

.PHONY : all thesis twoside clean msg-pre-clean msg-pre-pdf GIT_REV
