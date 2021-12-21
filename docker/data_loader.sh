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

echo "Cleaning up data-directory"
rm --recursive --force "$DATA_DIR"/* "$DATA_DIR"/.[!.]* "$DATA_DIR"/..?*

#Check if the backup is available
if [ -f "$BACKUP_DIR"/"$BACKUP_FILE" ]; then
  echo "Using $BACKUP_FILE to restore data"
  
  echo "extracting files"  
  tar --extract --file "$BACKUP_DIR"/"$BACKUP_FILE"
  
  echo "Move data to directory"
  mv /data/* /esqulino/data/prod
  
  echo "Restore database"
  psql --host "$DATABASE_HOST" --username "$DATABASE_USER" --no-password --dbname "$DATABASE_NAME" --file "$DB_DUMP" --quiet
  
  rm "$DB_DUMP"
else
  mkdir -p /esqulino/data/prod/projects
  TPUT_BIN=/bin/false make --directory /esqulino/server reset-live-data
fi

exit 0
