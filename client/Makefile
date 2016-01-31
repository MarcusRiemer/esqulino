TS_FILES = $(shell find app -iname "*.ts")
TS_JS_FILES = $(TS_FILES:.ts=.js)
TS_JS_MAP_FILES = $(TS_FILES:.ts=.js.map)

ALL_JS_FILES = $(shell find app -iname "*.js")
ALL_JS_MAP_FILES = $(JS_FILES:.js=.js.map)

# Compile by default
all : compile

# Uses the `package.json` file to grab all dependencies
install-deps :
	npm install

# Continously watches the .ts files for changes and recompiles
# them on the fly. Useful during development.
watch :
	npm run "tsc:w"

# One-shot compilation.
compile :
	npm run "tsc"

# Getting rid of all `.js` and `.js.map` files that have a corresponding
# `.ts` file.
clean :
	rm -f $(TS_JS_FILES) $(TS_JS_MAP_FILES)

# Getting rid of all `.js` and `.js.map` files in the app folder. There
# is no reason anything in that folder does not have a corresponding
# `.ts` file, but still this should be handled with care ...
clean-all :
	rm -f $(ALL_JS_FILES) $(ALL_JS_MAP_FILES)
