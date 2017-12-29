# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line.
SPHINXOPTS    =
SPHINXBUILD   = sphinx-build
SPHINXPROJ    = BlattWerkzeug
SOURCEDIR     = .
BUILDDIR      = _build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Generating pretty printed grammar files
generated/%.grammar:
	@mkdir -p generated
	@echo '{ "type": "printGrammar", "id": "$*" }' | make --no-print-directory -C ../../client cli-run | jq -r . | tee "generated/$*.grammar"

# Default set of pretty printed grammar files
pretty-grammars: generated/sql.grammar generated/dxml.grammar generated/regex.grammar 

livehtml:
	sphinx-autobuild -b html "$(SOURCEDIR)" $(BUILDDIR)/html $(SPHINXOPTS)

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile livehtml pretty-grammars
