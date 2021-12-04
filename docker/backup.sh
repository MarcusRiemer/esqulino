#/bin/bash

#Name of dump-file
DB_DUMP=db.dump

#Name of the backup-file
BACKUP_NAME=backup.tar

if ["$MODUS" = creat]; then
  #Crating the database-dump
  pg_dump --host "$DB_HOST" --username "$DB_USER" --no-password --file "$DB_DUMP" "$DB_NAME"
  #Creating an archiv with the data from the Server
  tar --create --file "$BACKUP_NAME" "$DATA_DIR"
  #Add the dump-file to the archiv
  tar --append --file "$BACKUP_NAME" "$DB_DUMP"
  
  mv "$BACKUP_NAME" "$BACKUP_DIR" 
else
  echo "MODUS must be set to creat" 1>&2 
fi
exit 0




