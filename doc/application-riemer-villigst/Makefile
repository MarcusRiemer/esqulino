application.pdf: application.tex
	latexmk -xelatex application.tex

core-concepts.pdf: ../manual/diagrams/core-concepts.svg

%.pdf:%.svg
	inkscape -z -f $< -A $@