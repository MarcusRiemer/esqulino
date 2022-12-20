SCREENSHOTS = $(wildcard screens/*.png)
AST_IMAGES = $(wildcard ast/*.pdf)
IMAGES = $(AST_IMAGES) $(SCREENSHOTS)

pdf: cserc-2022-syntaxfree-ide-generation.pdf
zip: cserc-2022-syntaxfree-ide-generation.zip

cserc-2022-syntaxfree-ide-generation.pdf : cserc-2022-syntaxfree-ide-generation.tex CSERC22.bib $(IMAGES)
	latexmk -xelatex $<

cserc-2022-syntaxfree-ide-generation.zip : cserc-2022-syntaxfree-ide-generation.pdf cserc-2022-syntaxfree-ide-generation.tex $(IMAGES)
	rm -rf taps_zip
	rm -f $@
	mkdir -p taps_zip/{pdf,source,source/screens,source/ast}
	cp $< taps_zip/pdf
	cp $(word 2,$^) taps_zip/source
	cp CSERC22.bib taps_zip/source
	cp $(SCREENSHOTS) taps_zip/source/screens
	cp $(AST_IMAGES) taps_zip/source/ast
	(cd taps_zip && zip -r ../$@ ./*)

.PHONY: pdf zip