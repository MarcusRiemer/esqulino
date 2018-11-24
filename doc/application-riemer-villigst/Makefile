CURR_GIT_REV = $(shell git rev-parse --short HEAD | tr -d '\n')
REMOTE_DIR = /srv/htdocs/playground.marcusriemer.de

figures : core-concepts.pdf ast-example-null.pdf ast-example-if.pdf ast-example-expr-variable.pdf ast-example-expr-binary.pdf ast-example-xml-node-two-attributes.pdf

application.pdf: application.tex GIT_REV
	latexmk -xelatex application.tex

core-concepts.pdf: ../manual/diagrams/core-concepts.svg

ast-example-null.pdf: ../manual/generated/ast-example-null.graphviz
ast-example-if.pdf: ../manual/generated/ast-example-if.graphviz
ast-example-expr-variable.pdf: ../manual/generated/ast-example-expr-variable.graphviz
ast-example-expr-binary.pdf: ../manual/generated/ast-example-expr-binary.graphviz
ast-example-xml-node-two-attributes.pdf: ../manual/generated/ast-example-xml-node-two-attributes.graphviz

GIT_REV :
	echo -n $(CURR_GIT_REV) > GIT_REV

%.pdf : ../manual/generated/%.graphviz
	dot -T pdf < $< > $@
	pdfcrop $@ $@

%.pdf : ../manual/diagrams/%.svg
	inkscape -z -f $< -A $@

publish-draft: application.pdf
	scp application.pdf marcus@kleopatra.gurxite.de:$(REMOTE_DIR)/application-riemer-villigst.pdf