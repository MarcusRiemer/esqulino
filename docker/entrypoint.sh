#!/bin/bash

#If the variable is not set the container exit with an error 
if [ -z "$SECRET_KEY_BASE" ]; then
	echo "Pleas set SECRET_KEY_BASE in the docker-compose-File" 1>&2
	exit 1
fi

#Only at the first start the server and the database will be resetet
FILE_NAME=init
if [ ! -e $FILE_NAME ]; then
	TPUT_BIN=/bin/false make --directory /esqulino/server reset-live-data
	echo "If you remove this File, the Server and Database will be reset after a newstart." >$FILE_NAME
fi

#If no command is set the server will be startet
if [ $# -eq 0 ]; then
	TPUT_BIN=/bin/false make --directory /esqulino/server run
else
	exec "$@"
fi
