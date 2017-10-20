#!/bin/bash

url='localhost.localdomain:9292/api/project/pokemongo/image'

user=
pass=

IFS=$'\n'
set -f
for line in `cat < "$1"`
do
	i=`echo "$line" | cut -d ',' -f 1`
	name=`echo "$line" | cut -d ',' -f 2`
	echo "$name"
	uuid=$(curl \
		-s \
		--user "$user:$pass" \
		--form "image-file=@images/`printf %03d $i`.png;filename=$i.png" \
		--form "image-name=$name" \
		--form "author-name=Nintendo" \
		--form "author-url=nintendo.com" \
		--form "licence-name=proprietary" \
		--form "licence-url=" \
		-X POST "$url")
	echo "$uuid"
	echo "$i,$uuid" >> uuids.csv
	
done
