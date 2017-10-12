#!/bin/bash

url='localhost.localdomain:9292/api/project/pokemongo/image'

user=
pass=

IFS=$'\n'
set -f
for line in `cat < "$1"`
do
	uuid= echo "$line" | cut -d ',' -f 2
	echo "$uuid"
	curl \
		-s \
		--user "$user:$pass" \
		-X DELETE "$url/$uuid"
done
