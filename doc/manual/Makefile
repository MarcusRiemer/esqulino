# Minimal makefile for Sphinx documentation

# You can set these variables from the command line.
SPHINXOPTS    =
SPHINXBUILD   = sphinx-build
SPHINXPROJ    = BlattWerkzeug
SOURCEDIR     = .
BUILDDIR      = _build

# Paths to internal tools
MAKE_CLIENT = make --no-print-directory -C ../../client
CLI_PROG_CLIENT = ../../client/dist/cli/main.cli.js

# Put help first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Generating pretty printed grammar files
generated/%.grammar: $(CLI_PROG_CLIENT)
	@mkdir -p generated
	@echo '{ "type": "printGrammar", "id": "$*" }' | node $(CLI_PROG_CLIENT) | jq -r . | tee "generated/$*.grammar"

generated/%.blocks: $(CLI_PROG_CLIENT)
	@mkdir -p generated
	@echo '{ "type": "printLanguageModel", "id": "$*" }' | node $(CLI_PROG_CLIENT) | jq -r . | tee "generated/$*.blocks"

generated/%.graphviz: syntaxtree/%.json $(CLI_PROG_CLIENT)
	@mkdir -p generated
	@echo '{ "type": "graphvizTree", "model": $(shell cat "$<" | jq -c .)}' | node $(CLI_PROG_CLIENT) | jq -r . | tee "generated/$*.graphviz"

# Default set of pretty printed grammar files
pretty-grammars: generated/sql.grammar generated/dxml.grammar generated/regex.grammar

# Default set of pretty printed blocks
pretty-blocks: generated/xml.blocks generated/dxml.blocks generated/sql.blocks

# Default set of graphviz trees
graphviz-trees: generated/ast-example-if.graphviz generated/ast-example-if-no-pred.graphviz

clean:
	rm -rf generated _build

livehtml:
	sphinx-autobuild -b html "$(SOURCEDIR)" $(BUILDDIR)/html $(SPHINXOPTS)

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
html: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile livehtml pretty-grammars pretty-blocks clean
