TEX_FILES = $(shell find . -type f -iname "*.tex")
CURR_GIT_REV = $(shell git rev-parse --short HEAD | tr -d '\n')
REMOTE_DIR = /srv/htdocs/playground.marcusriemer.de

PDF_FILENAME = thesis.pdf

SCHEMA_IMAGE_FILES = $(addprefix images/db-schema/, cyoa.pdf pokemongo.pdf blog.pdf)

all : $(PDF_FILENAME)

#################################
# Document generation
#################################

GIT_REV :
	echo -n $(CURR_GIT_REV) > GIT_REV

# Compiling the actual thesis document
$(PDF_FILENAME) : msg-pre-pdf $(TEX_FILES) GIT_REV
	@rubber --warn refs --warn misc --pdf thesis.tex

# Uploads the current PDF version to a public HTTP server.
publish-draft: msg-pre-pdf $(PDF_FILENAME)
	scp $(PDF_FILENAME) marcus@kleopatra.gurxite.de:$(REMOTE_DIR)/marcus-riemer-master-thesis.pdf
	ssh marcus@kleopatra.gurxite.de "cp $(REMOTE_DIR)/marcus-riemer-master-thesis.pdf $(REMOTE_DIR)/master-thesis-$(CURR_GIT_REV).pdf"

	touch publish-draft

clean : msg-pre-clean
	rm -f $(PDF_FILENAME)
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

.PHONY : all clean msg-pre-clean msg-pre-pdf GIT_REV

