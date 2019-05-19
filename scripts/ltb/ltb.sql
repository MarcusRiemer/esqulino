--
-- File generated with SQLiteStudio v3.2.1 on Sa Mai 18 22:04:56 2019
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: auflagen
CREATE TABLE auflagen (name STRING, auflage INT, datum DATE, bild_url STRING, seitenanzahl INT);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
