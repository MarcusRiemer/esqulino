CLIENT_SOURCES   = client/ts/main.ts
CLIENT_TEMPLATES = client/tmpl/index.html

BUILD_SOURCES    = build/js/main.js
BUILD_TEMPLATES  = build/tmpl/index.html

watch-tsc :
	cd client && npm run "tsc:w"

run-server :
	cd server && rackup config.ru

.PHONY : run

