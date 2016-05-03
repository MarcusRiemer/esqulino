SCHEMA_PATH = ../../schema/json
SWAGGER_JAR = ~/bin/swagger-codegen-cli.jar

include $(SCHEMA_PATH)/Makefile.json

all : html/index.html

html/index.html : $(DIST_FILES) swagger.yaml
	java -jar $(SWAGGER_JAR) generate -i swagger.yaml -l html -o html
clean :
	rm -f $(DIST_FILES)
	rm -rf html

.PHONY : all clean
