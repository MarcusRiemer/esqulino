TEX_FILES = $(shell find . -type f -iname "*.tex")
CURR_GIT_REV = $(shell git rev-parse --short HEAD | tr -d '\n')

PDF_FILENAME = ole-just-thesis.pdf
PDF_FILENAME_TWOSIDE = ole-just-thesis-twoside.pdf

all : $(PDF_FILENAME) $(PDF_FILENAME_TWOSIDE)

#################################
# Document generation
#################################

GIT_REV :
	echo -n $(CURR_GIT_REV) > GIT_REV

# Compiling the actual thesis document
$(PDF_FILENAME) : msg-pre-pdf $(TEX_FILES) GIT_REV
	@rubber --unsafe --warn refs --warn misc --pdf --jobname $(basename $@) thesis.tex

$(PDF_FILENAME_TWOSIDE) : msg-pre-pdf-twosided $(TEX_FILES) GIT_REV
	@rubber --unsafe --warn refs --warn misc --pdf --jobname $(basename $@) thesis-twosided.tex

clean : msg-pre-clean
	rm -f $(PDF_FILENAME) $(PDF_FILENAME_TWOSIDE)
	rubber --clean thesis.tex

#################################
# Schema Image Generation
#################################

all-db-schema-images : $(SCHEMA_IMAGE_FILES)

images/db-schema/%.pdf : ../../data/dev/projects/%/databases/default.sqlite
	schemacrawler.sh -server sqlite -database $< -infolevel=standard -noinfo=true -portablenames -password=  -command graph -outputformat pdf -outputfile=$@

##################################
# Message targets
##################################
msg-pre-clean :
	@tput setaf 2; echo "## Thesis : Cleaning"; tput sgr0

msg-pre-pdf :
	@tput setaf 2; echo "## Thesis : Generating PDF"; tput sgr0

msg-pre-pdf-twosided :
	@tput setaf 2; echo "## Thesis : Generating PDF (twosided)"; tput sgr0

.PHONY : all clean msg-pre-clean msg-pre-pdf GIT_REV

