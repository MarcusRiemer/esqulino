#/bin/bash

#Name of dump-file
DB_DUMP=dump.sql

#Name of the backup-file
BACKUP_NAME=backup.tar

if [ "$MODUS" = create ]; then
  #Crating the database-dump
  pg_dump --host "$DB_HOST" --username "$DB_USER" --no-password --file "$DB_DUMP" "$DB_NAME"
  #Creating an archiv with the data from the server
  tar --create --file "$BACKUP_NAME" "$DATA_DIR"
  #Add the dump-file to the archiv
  tar --append --file "$BACKUP_NAME" "$DB_DUMP"
  
  mv "$BACKUP_NAME" "$BACKUP_DIR" 
elif [ "$MODUS" = restore ]; then
  #Check if the backup is available
  if [ ! -e "$BACKUP_DIR"/"$BACKUP_NAME" ]; then
    echo "$BACKUP_NAME is missing" 1>&2
    exit 2
  fi
  
  #Remove all data from the server
  rm --recursive --force "$DATA_DIR"/* "$DATA_DIR"/.[!.]* "$DATA_DIR"/..?*
  #Restore the data
  tar --extract --file "$BACKUP_DIR"/"$BACKUP_NAME"
  #Restore the database
  psql --host "$DB_HOST" --username "$DB_USER" --no-password --dbname "$DB_NAME" --file "$DB_DUMP"
  
  rm "$DB_DUMP" 
else
  echo "MODUS must be set to creat or restore" 1>&2 
  exit 1
fi

exit 0




