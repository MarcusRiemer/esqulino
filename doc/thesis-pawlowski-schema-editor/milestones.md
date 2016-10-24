# Bachelor-Thesis Marco Pawlowski: Ein Schema-Editor für esqulino

Für die Schüler-Entwicklungsumgebung "esqulino" soll ein Schema-Editor für relationale Datenbanken entwickelt werden. Dabei müssen insbesondere die speziellen Erfordernisse der Zielgruppe berücksichtigt werden.

# Meilensteine

Die Entwicklung erfolgt in etwa anhand dieser Meilensteine.

## Neue Darstellung

* Client: Typische vertikale Darstellung der Spalten einer Tabelle, ähnlich UML oder MySQL Workbench

## Erste mutierende Operationen

Dieser Meilenstein nimmt CSV-Dateien als Grundlage für das Anlegen neuer Tabellen. Dadurch entfällt der unmittelbare Bedarf nach einem möglicherweise komplizierten Schema-Editor für neue Tabellen.

* Server: Löschen von existierenden Tabellen
* Server: Anlegen neuer Tabellen auf Basis einer CSV Datei
* Client: Entsprechende Funktionalität über die Oberfläche verfügbar machen
    * Vorschau des Schemas, das sich aus der CSV-Datei ergibt
    * Optional: Auswahl von PK-Spalten
    * Optional: Angabe von FK-Beziehungen

Optional denkbar wäre in diesem Schritt die Unterstützung bei der Angabe von Spalten die sich als Schlüssel eignen. Für eine erste Version kann jedoch einfach stumpf die erste Spalte als Schlüssel angenommen werden.

## Anzeige von Daten

* Server: Endpunkt zum anzeigen aller Datensätze einer Tabelle, ggfs. mit Offset und Limit
* Client: Anzeige der Datensätze einer Tabelle

## Komplexe Darstellung

Dieser Schritt ist technisch herausfordernd: Es stellt sich die Frage mit welcher Technik die 2D-Zeichenfläche im Zusammenspiel mit Angular 2 am effektivsten umgesetzt werden kann. Hier kommen von reinem HTML über SVG oder auch Ergänzungen mit dem HTML5-canvas-Element sehr viele Technologien mit individuelle Vor- und Nachteilen in Frage.

* Client: Anordnung von Tabellen auf einer 2D Zeichenfläche
* Client: Visualisierung von FK-Beziehungen

## Refactoring

Vorab: Untersuchen welche Refaktoring-Operationen von SQLite überhaupt unterstützt werden. Möglicherweise müssen alle diese Operationen durch Löschen und Neu-Anlegen der Tabellen implementiert werden?

* Server: Refactoring existierender Tabellen
    * Spalten umbenennen
    * Spalten hinzufügen
    * Spalten löschen
    * Spalten umsortieren
    * Weitere ..?
* Client: Interface für diese Operationen