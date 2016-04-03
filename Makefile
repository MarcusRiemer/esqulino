# This makefile does not much work itself, but it routes the available targets
# to the specific targets for server, client or whatever. If you want to e.g.
# ONLY install dependencies for the client, change to the `client` folder
# first and call `install-deps` there.

# Installs libraries this project depends on. For this to actually work,
# you will need to have npm (for the client) and bundle (for the server)
# installed.
install-deps :
	make -C server install-deps
	make -C client install-deps

# Continously compiles the clients typescript files, useful during
# development.
client-watch :
	make -C client watch

# One-shot compilation of client
client-compile :
	make -C client compile

# Runs the server in development mode, this is probably not a good idea to
# do in a productive environment. It simply uses a built-in Sinatra server,
# which probably will be webrick.
server-run :
	make -C server run

# Compile every part of the documentation, including the thesis.
doc :
	make -C server doc
	make -C doc/elaboration thesis

# Used during development: Prettyprints all available JSON Files, the use of
# sponge is basically a substitute for "jq . < {} > {}" (in place editing of
# the same file).
# BEWARE: If any of the input files is not syntactically valid JSON (this
# *includes* quoted keys) the output file will be empty.
dev-pretty-json-data :
	find data -iname "*.json" -exec bash -c 'jq . < {} | sponge {}' \;

# Used during development: Strips all trailing whitespace from "own"
# sourcefiles.
dev-delete-trailing-whitespace :
	find client/app \( -name '*.ts' -o -name '*.html' -o -name '*.scss' \) -exec sed --in-place 's/[[^:space]]\+[[:space:]]\+$$//' {} \+
	find server -type f \( -name '*.rb' \) -exec sed --in-place 's/[[^:space]]\+[[:space:]]\+$$//' {} \+


.PHONY : install-deps client-watch server-run doc

