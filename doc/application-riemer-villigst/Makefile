figures : core-concepts.pdf ast-example-null.pdf ast-example-if.pdf ast-example-expr-variable.pdf ast-example-expr-binary.pdf

application.pdf: application.tex
	latexmk -xelatex application.tex

core-concepts.pdf: ../manual/diagrams/core-concepts.svg

ast-example-null.pdf: ../manual/generated/ast-example-null.graphviz
ast-example-if.pdf: ../manual/generated/ast-example-if.graphviz
ast-example-expr-variable.pdf: ../manual/generated/ast-example-expr-variable.graphviz
ast-example-expr-binary.pdf: ../manual/generated/ast-example-expr-binary.graphviz

%.pdf : ../manual/generated/%.graphviz
	dot -T pdf < $< > $@
	pdfcrop $@ $@

%.pdf : ../manual/diagrams/%.svg
	inkscape -z -f $< -A $@