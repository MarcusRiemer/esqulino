#!/bin/bash

#Name of dump-file
DB_DUMP=dump.sql

#Name of the backup-file
BACKUP_FILE=backup.tar

if ! pg_isready --host "$DATABASE_HOST" --quiet; then
    echo "Waiting for database..."
  while ! pg_isready --host "$DATABASE_HOST" --quiet; do 
    :
  done
  echo "Database is ready"
fi

#Check if the backup is available
if [ -f "$BACKUP_DIR"/"$BACKUP_FILE" ]; then
  echo "Using $BACKUP_FILE to restore data"
    
  tar --extract --file "$BACKUP_DIR"/"$BACKUP_FILE"
  
  mv /data /esqulino/data/prod
  
  psql --host "$DATABASE_HOST" --username "$DATABASE_USER" --no-password --dbname "$DATABASE_NAME" --file "$DB_DUMP"
  
  rm "$DB_DUMP"
else
  TPUT_BIN=/bin/false make --directory /esqulino/server reset-live-data
fi
