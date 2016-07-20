TEX_FILES = $(shell find . -type f -iname "*.tex")

PDF_FILENAME = thesis.pdf

all : $(PDF_FILENAME)

# Compiling the actual thesis document
$(PDF_FILENAME) : msg-pre-pdf $(TEX_FILES)
	@rubber --pdf thesis.tex

# Uploads the current PDF version to a public HTTP server.
publish-draft: msg-pre-pdf $(PDF_FILENAME)
	scp $(PDF_FILENAME) marcus@kleopatra.gurxite.de:/srv/htdocs/playground.marcusriemer.de/master-thesis-sql.pdf
	touch publish-draft

clean : msg-pre-clean
	rm -f $(PDF_FILENAME) *.aux *.blg *.out *.bbl *.log

##################################
# Message targets
##################################
msg-pre-clean :
	@tput setaf 2; echo "## Thesis : Cleaning"; tput sgr0

msg-pre-pdf :
	@tput setaf 2; echo "## Thesis : Generating PDF"; tput sgr0

.PHONY : all clean msg-pre-clean msg-pre-pdf

