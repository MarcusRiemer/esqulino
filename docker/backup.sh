#!/bin/bash

#Name of dump-file
DB_DUMP=dump.sql

#Name of the backup-file
BACKUP_NAME=backup.tar

#Crating the database-dump
pg_dump --host "$DB_HOST" --username "$DB_USER" --no-password --file "$DB_DUMP" "$DB_NAME"
#Creating an archiv with the data from the server
tar --create --file "$BACKUP_NAME" "$DATA_DIR"
#Add the dump-file to the archiv
tar --append --file "$BACKUP_NAME" "$DB_DUMP"
  
mv "$BACKUP_NAME" "$BACKUP_DIR" 

exit 0




