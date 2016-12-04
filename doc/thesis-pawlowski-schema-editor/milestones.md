# Bachelor-Thesis Marco Pawlowski: Ein Schema-Editor für Blattwerkzeug

Für die Schüler-Entwicklungsumgebung "Blattwerkzeug" soll ein Schema-Editor für relationale Datenbanken entwickelt werden. Dabei müssen insbesondere die speziellen Erfordernisse der Zielgruppe berücksichtigt werden.

# Meilensteine

Die Entwicklung erfolgt in etwa anhand dieser Meilensteine.

## Neue Darstellung

* Client: Typische vertikale Darstellung der Spalten einer Tabelle, ähnlich UML oder MySQL Workbench
* Client: Ulli würde eine tatsächliche tabellarische Darstellung bevorzugen, das könnte auch spannend sein. Vielleicht mit einer reduzierten Anzahl von Spalten?
* Client: In der Schema Ansicht, sollen die Tabellen so angezeigt werden, wie sie in der Workbench und anderen Programmen dargestellt werden. Dies bedeutet: Spalten in Zeilen. In der Anzeige der Datensätze wird die tatsächliche tabellarische Darstellung dargestellt.

## Anzeige von Daten

* Server: Endpunkt zum anzeigen aller Datensätze einer Tabelle, ggfs. mit Offset und Limit
* Client: Anzeige der Datensätze einer Tabelle
* Client: Anzeige der Datensätze theoretisch an zwei Stellen: Aus dem Editieren einer Tabelle heraus, um sie die Änderungen der Tabelle mit den Daten anzeigen zu lassen. Dann direkt aus der Schema Darstellung.

## Editieren der Tabellen

Vorab: Untersuchen welche Refaktoring-Operationen von SQLite überhaupt unterstützt werden. Möglicherweise müssen alle diese Operationen durch Löschen und Neu-Anlegen der Tabellen implementiert werden?
Durch den jetzigen Aufbau, und vorhanden sein der Datensätze beim Editieren, wird wohl der leichteste Schritt sein, eine Tabelle zu löschen und eine neue zu erstellen. 

* Server: Refactoring existierender Tabellen und Testfälle dazu
    * Spalten umbenennen
    * Spalten hinzufügen
    * Spalten löschen
    * Spalten umsortieren
    * Weitere ..?
* Client: Interface für diese Operationen

# Datensätze einpflegen

Es soll möglich sein, einer vorhandenen Tabelle Datensätze durch csv-Dateien einzupflegen.
Dabei muss auf richtiges Format der csv-Datei geachtet werden.


## Gestrichene Punkte ##

## Erste mutierende Operationen

Dieser Meilenstein nimmt CSV-Dateien als Grundlage für das Anlegen neuer Tabellen. Dadurch entfällt der unmittelbare Bedarf nach einem möglicherweise komplizierten Schema-Editor für neue Tabellen. 

* Server: Löschen von existierenden Tabellen
* Server: Anlegen neuer Tabellen auf Basis einer CSV Datei, mit Testfällen
* Client: Entsprechende Funktionalität über die Oberfläche verfügbar machen
    * Vorschau des Schemas, das sich aus der CSV-Datei ergibt
    * Optional: Auswahl von PK-Spalten
    * Optional: Angabe von FK-Beziehungen

Optional denkbar wäre in diesem Schritt die Unterstützung bei der Angabe von Spalten die sich als Schlüssel eignen. Für eine erste Version kann jedoch einfach stumpf die erste Spalte als Schlüssel angenommen werden.


## Komplexe Darstellung

Dieser Schritt ist technisch herausfordernd: Es stellt sich die Frage mit welcher Technik die 2D-Zeichenfläche im Zusammenspiel mit Angular 2 am effektivsten umgesetzt werden kann. Hier kommen von reinem HTML über SVG oder auch Ergänzungen mit dem HTML5-canvas-Element sehr viele Technologien mit individuelle Vor- und Nachteilen in Frage. Möglicherweise kann man zur Positionierung gut auf graphviz zurückgreifen?

* Client: Anordnung von Tabellen auf einer 2D Zeichenfläche
* Client: Visualisierung von FK-Beziehungen


