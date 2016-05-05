include ../../schema/json/Makefile.json

SWAGGER_JAR = ~/bin/swagger-codegen-cli.jar


copy-schema : $(JSON_SCHEMA_FILE_NAMES)

%.json : $(SCHEMA_PATH)/%.json
	cp $^ $@

all : $(JSON_SCHEMA_FILE_NAMES) html/index.html

html/index.html : $(JSON_SCHEMA_FILES) swagger.yaml
	java -jar $(SWAGGER_JAR) generate -i swagger.yaml -l html -o html
clean :
	rm -f $(JSON_SCHEMA_FILE_NAMES)
	rm -rf html

.PHONY : all clean
