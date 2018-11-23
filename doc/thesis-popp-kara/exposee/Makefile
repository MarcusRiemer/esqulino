
all: exposee.pdf outline.pdf roadmap.pdf

roadmap_img.pdf: roadmap.dot
	# Had to be edited manually :/
	# dot -Tpdf $< -o $@

roadmap_img.svg: roadmap.dot
	# dot -Tsvg $< -o $@

roadmap.pdf: roadmap.md roadmap_img.pdf

%.pdf: %.md
	pandoc $< \
		-f gfm \
		-t latex \
		-s \
		-o $@ \
		--pdf-engine xelatex \
		-V papersize=a4 \
		-V mainfont="DaxlinePro" \
		-V fontsize=12pt \
		-V documentclass=article \
		-V links-as-notes \
		-V geometry="margin=1in"

%.tex: %.md
	pandoc $< \
		-f gfm \
		-t latex \
		-s \
		-o $@ \
		--pdf-engine xelatex \
		-V papersize=a4 \
		-V mainfont="DaxlinePro" \
		-V fontsize=12pt \
		-V documentclass=article \
		-V links-as-notes \
		-V geometry="margin=1in"
