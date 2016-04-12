SRC_PATH = ../../client/app/shared

all : ProjectDescription.json ProjectListDescription.json QueryResultDescription.json QueryParamsDescription.json ArbitraryQueryRequestDescription.json

ProjectDescription.json : $(SRC_PATH)/project.description.ts
	typescript-json-schema $^ $(basename $@) > $@

ProjectListDescription.json : $(SRC_PATH)/project.description.ts
	typescript-json-schema $^ $(basename $@) > $@

QueryResultDescription.json : $(SRC_PATH)/query.result.ts
	typescript-json-schema $^ $(basename $@) > $@

QueryParamsDescription.json : $(SRC_PATH)/query.result.ts
	typescript-json-schema $^ $(basename $@) > $@

ArbitraryQueryRequestDescription.json : $(SRC_PATH)/query.result.ts
	typescript-json-schema $^ $(basename $@) > $@
