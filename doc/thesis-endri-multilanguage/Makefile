
CLI_PROG_CLIENT = ../../client/dist/cli/main.cli.js


# Generating pretty printed grammar files
generated/%.grammar: $(CLI_PROG_CLIENT)
	@mkdir -p generated
	@echo '{ "type": "printGrammar", "programmingLanguageId": "$*" }' | node $(CLI_PROG_CLIENT) | jq -r . | tee "generated/$*.grammar"

generated/%.blocks: $(CLI_PROG_CLIENT)
	@mkdir -p generated
	@echo '{ "type": "printBlockLanguage", "blockLanguageId": "$*" }' | node $(CLI_PROG_CLIENT) | jq -r . | tee "generated/$*.blocks"

generated/%.graphviz: examples/syntaxtree/%.json $(CLI_PROG_CLIENT)
	@mkdir -p generated
	@echo '{ "type": "graphvizTree", "model": $(shell cat "$<" | jq -c .)}' | node $(CLI_PROG_CLIENT) | jq -r . | tee "generated/$*.graphviz"

# Code for generating pdfs from json ASTs
#generated/%.graphviz: generated/%.json $(CLI_PROG_CLIENT)
#	echo '{ "type": "graphvizTree", "model": $(shell cat "$<" | jq -c .)}' | node $(CLI_PROG_CLIENT) | jq -r . | tee "$@"

generated/%.pdf: generated/%.graphviz 
	dot -T pdf "$<" > "$@"

