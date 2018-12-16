# Exposé

**Thema: Kara-Umgebung (working title)**

Aufgabe der Abschlussarbeit soll die Integration eines Tools zum spielerischen Erlernen von Programmierfähigkeiten in die von Marcus Riemer entwickelte Umgebung [Blattwerkzeug][1] sein. Als Vorbilder dieser Anwendung sollen dabei [Kara][2] und [Lightbot][3] dienen.

Das im Rahmen der Abschlussarbeit zu entwickelnde Programm soll ermöglichen, sich mit einer überschaubaren imperativen Programmiersprache in einer Welt zu bewegen und dabei eine bestimmte, noch zu definierende Aufgabe zu lösen.

Vorgegebene Technologien sind das Front-End-Webapplikationsframework Angular in einer zu 7 kompatiblen Version, sowie die Programmiersprache TypeScript. Die Ermittlung weiterer benötigter Technologien wird im Rahmen der Abschlussarbeit und unter Berücksichtigung dieser Grundtechnologien stattfinden.

## Datenstrukturen / Grammatiken

Im Rahmen der Abschlussarbeit sollen zunächst zwei Datenstrukturen in Form von Grammatiken entwickelt und mithilfe der von Marcus Riemer beschriebenen Syntax Bäume (oder vielmehr deren JSON-Repräsentation) umgesetzt werden. Eine Sprache dient dabei der Definition eines Levels und beschreibt die Welt, durch welche der Spieler später navigieren muss. Die zweite Sprache dient der Navigation durch das entsprechende Level. Dabei müssen Befehle für eine sequenzielle Abfolge zum Bewegen der Spielfigur implementiert werden. Als Mindestanforderung gilt der Umfang der Vorbild-Anwendung Lightbot, welche die Grundstruktur von Sequenzen, den Aufruf von atomaren Befehlen, sowie die Definition von Prozeduren (Sprünge) ermöglicht. Die Implementierung komplexerer Konzepte der Programmierung wie Schleifen, Verzweigungen und Variablen, ist optional ebenfalls denkbar. Es muss abgewogen werden, in welcher Form ein Programm das Level aufrufen soll, durch welches es navigiert.

Die Programmierung erfolgt für den Nutzer mithilfe des Drag-and-Drop-Interface von Blattwerkzeug, welcher nicht Teil der Abschlussarbeit ist. Die im Rahmen der Abschlussarbeit entwickelten Grammatiken werden Blattwerkzeug zur Verfügung gestellt und ein entsprechender Syntaxbaum, welcher das vom Nutzer erstellte Programm repräsentiert, wird zur Verarbeitung zurückgegeben.

## Level-Editor

Es soll ein rudimentärer Level-Editor bereitgestellt werden, mithilfe dessen Lehrkräften ermöglicht wird, Level für Ihre Schüler zu erzeugen, welche diese dann lösen können.

## Interface

Das Level, sowie die Ausführung des Programmes soll wie bei den Vorbildern in einer verspielten Art grafisch dargestellt werden. Zentrale Frage wird hier die Technik sein, mit der die Darstellung erfolgt. Beispielhaft wurden im Rahmen der Vorbesprechung klassisches HTML, SVGs oder das Canvas-Element angesprochen. Bei der Auswahl der UI-Technologie sollte besonders die Kompatibilität mit Angular berücksichtigt werden. Die Darstellung wird in Blattwerkzeug eingebunden. Es muss eine Metapher gefunden werden, welche alle Möglichkeiten der Datenstruktur abbilden kann.

## Ausführung

Es wird eine wichtige Frage der Abschlussarbeit sein, wie die Interpretation des schließlich aus dem Drag-and-Drop-Interface generierten Syntaxbaums umgesetzt wird. Dabei ist sowohl ein Interpretieren als auch ein Kompilieren des generierten Syntaxbaums denkbar.
In beiden Varianten müssen Informationen über den Zustand bzw. den Fortschritt des ausgeführten Programms an eine von Blattwerkzeug zur Verfügung gestellte Schnittstelle gegeben werden, wodurch der Nutzer in der Lage sein wird, den Fortschritt seines Programms visuell im Drag-and-Drop-Interface zu verfolgen. Die Darstellung im Drag-and-Drop-Interface ist jedoch nicht Teil der Abschlussarbeit.

## Level

Es sollen einige Level vordefiniert werden, die die Funktionen der entwickelten Software vorführen.

[1]: https://blattwerkzeug.de/
[2]: https://www.swisseduc.ch/informatik/karatojava/kara/
[3]: http://lightbot.com/
