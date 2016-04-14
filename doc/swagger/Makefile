SRC_PATH = ../../client/app/shared

DIST_FILES = ProjectDescription.json ProjectListDescription.json QueryResultDescription.json QueryParamsDescription.json ArbitraryQueryRequestDescription.json QueryUpdateRequestDescription.json QueryDescription.json

all : $(DIST_FILES)

html/index.html : $(DIST_FILES) swagger.yaml
	java -jar ~/bin/swagger-codegen-cli.jar generate -i swagger.yaml -l html -o html
clean :
	rm -f $(DIST_FILES)
	rm -rf html

ProjectDescription.json : $(SRC_PATH)/project.description.ts
	typescript-json-schema $^ $(basename $@) > $@

ProjectListDescription.json : $(SRC_PATH)/project.description.ts
	typescript-json-schema $^ $(basename $@) > $@

QueryDescription.json : $(SRC_PATH)/query.model.ts
	typescript-json-schema $^ Query > $@

QueryUpdateRequestDescription.json : $(SRC_PATH)/query.ts
	typescript-json-schema $^ $(basename $@) > $@

QueryResultDescription.json : $(SRC_PATH)/query.result.ts
	typescript-json-schema $^ $(basename $@) > $@

QueryParamsDescription.json : $(SRC_PATH)/query.result.ts
	typescript-json-schema $^ $(basename $@) > $@

ArbitraryQueryRequestDescription.json : $(SRC_PATH)/query.result.ts
	typescript-json-schema $^ $(basename $@) > $@

.PHONY : all clean
