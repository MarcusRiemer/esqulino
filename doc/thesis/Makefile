TEX_FILES = $(shell find . -type f -iname "*.tex")

PDF_FILENAME = thesis.pdf

all : $(PDF_FILENAME)

$(PDF_FILENAME) : $(TEX_FILES)
	pdflatex thesis.tex
	biber thesis
	pdflatex thesis.tex
	pdflatex thesis.tex

publish-draft: $(PDF_FILENAME)
	scp report.pdf marcus@ssh.rapunzel.gurxite.de:/srv/htdocs/playground.marcusriemer.de/master-thesis-sql.pdf
	touch publish-draft

.PHONY : all
