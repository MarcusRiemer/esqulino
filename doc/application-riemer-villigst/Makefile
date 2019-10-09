REMOTE_DIR = /srv/htdocs/playground.marcusriemer.de

figures : core-concepts.pdf ast-example-null.pdf ast-example-if.pdf ast-example-expr-variable.pdf ast-example-expr-binary.pdf ast-example-xml-node-two-attributes.pdf

application.pdf: application.tex figures
	latexmk -xelatex application.tex

application.docx: application.tex figures
	pandoc -s application.tex -o application.docx

core-concepts.pdf: ../manual/diagrams/core-concepts.svg

ast-example-null.pdf: ../manual/generated/ast-example-null.graphviz
ast-example-if.pdf: ../manual/generated/ast-example-if.graphviz
ast-example-expr-variable.pdf: ../manual/generated/ast-example-expr-variable.graphviz
ast-example-expr-binary.pdf: ../manual/generated/ast-example-expr-binary.graphviz
ast-example-xml-node-two-attributes.pdf: ../manual/generated/ast-example-xml-node-two-attributes.graphviz

%.pdf : ../manual/generated/%.graphviz
	dot -T pdf < $< > $@
	pdfcrop $@ $@

%.pdf : ../manual/diagrams/%.svg
	inkscape -z -f $< -A $@

publish-draft: application.pdf
	scp application.pdf marcus@kleopatra-tunnel:$(REMOTE_DIR)/blattwerkzeug-project-description.pdf

publish-draft-docx: application.docx
	scp application.docx marcus@kleopatra-tunnel:$(REMOTE_DIR)/application-riemer-villigst.docx