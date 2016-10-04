# Bachelor-Thesis Marco Pawlowski: Ein Schema-Editor für esqulino

Für die Schüler-Entwicklungsumgebung "esqulino" soll Schema-Editor für relationale Datenbanken entwickelt werden. Dabei müssen insbesondere die speziellen Erfordernisse der Zielgruppe berücksichtigt werden.

# Meilensteine

Die Entwicklung erfolgt in etwa anhand dieser Meilensteine.

## Neue Darstellung

* Client: Typische vertikale Darstellung der Spalten einer Tabelle, ähnlich UML oder MySQL Workbench

## Erste mutierende Operationen

* Server: Löschen von existierenden Tabellen
* Server: Anlegen neuer Tabellen auf Basis einer CSV Datei
* Client: Entsprechende Funktionalität über die Oberfläche verfügbar machen
* Client: Vorschau des Schemas, das sich aus der CSV-Datei ergibt
* Client: Auswahl von PK-Spalten
* Client: Anlegen von FK-Beziehungen

## Anzeige von Daten

* Server: Endpunkt zum anzeigen aller Datensätze einer Tabelle, ggfs. mit Offset und Limit
* Client: Anzeige der Datensätze einer Tabelle

## Komplexe Darstellung

* Client: Anordnung von Tabellen auf einer 2D Zeichenfläche
* Client: Visualisierung von FK-Beziehungen

## Refactoring

* Server: Refactoring existierender Tabellen
** Spalten umbenennen
** Spalten hinzufügen
** Spalten löschen
** Spalten umsortieren
** Weitere ..?
* Client: Interface für diese Maßnahmen