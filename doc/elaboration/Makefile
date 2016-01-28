TEX_FILES = $(shell find . -type f -iname "*.tex")

all : report.pdf

report.pdf : $(TEX_FILES)
	pdflatex report.tex

publish-draft: report.pdf
	scp report.pdf marcus@ssh.rapunzel.gurxite.de:/srv/htdocs/playground.marcusriemer.de/master-thesis-sql.pdf
	touch publish-draft

.PHONY : all
