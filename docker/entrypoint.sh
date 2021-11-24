#!/bin/bash

if [ -z "$SECRET_KEY_BASE" ]; then
	echo "Pleas set SECRET_KEY_BASE in the docker-compose-File" 1>&2
	exit 1
fi

FILE_NAME=init

if [ ! -e $FILE_NAME ]; then
	make --directory /esqulino/server reset-live-data
	echo "If you remove this File, the Server and Database will be reset after a newstart." >$FILE_NAME
fi

exec "$@"
