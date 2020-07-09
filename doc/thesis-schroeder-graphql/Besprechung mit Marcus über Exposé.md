## Vorgehen
Das Exposé stellt eine grundlegende Absicherung zwischen den Betreuern einer Bachelorarbeit in einem Unternehmen und einer Universität, sowie des Studenten, in Bezug auf den genauen Inhalt der Arbeit, dar. Da meine Bachelorarbeit nicht in Kooperation mit einer Firma geschieht, kann auf eine Absicherung verzichtet werden und durch eine Roadmap und erste Kapitel der Bachelorarbeit ersetzt werden.

## Roadmap
* Status Quo
  * SQL Datenbank mit  JSON Blobs 
  * Datenvielfalt in der Darstellung
    * Tabellen Ansicht im Admin Backend Bereich
    * Kacheldarstellung im Frontend    
    * Komplett geladenes Projekt - z.B. Darstellung bei Editierung
* Aktuelle Techniken zur Gewährleistung der Typsicherheit
  * JSON Schema Validator Datenbank
  * JSON Schema Validator für Requests
  * JSON Schema Validator für Responses
  * Erzeugen von JSON Schema aus Typescript interfaces
* Limitierung des aktuellen Ansatzes
   * Auswahl von Attributen
     * Ein Interface pro Anfrage und Antwort erstellen
     * Pro Interface Eintrag in Makefile
 * Anforderungen Formulieren
   * Welcher Ansatz ist gut und sollte beibehalten werden
   * Welcher Ansatz sollte lieber überarbeitet/optimiert werden
     * Makefile entfernen und durch andere Technik ersetzen
 * "Wie unser leben  erleichtern"
	*  JSON Api
	* GraphQL
	* Optimierung der bestehenden Lösung (make or buy)
*  Fazit/Tendenz

## Mögliche Resultate
Bei der Arbeit geht es im Grundgedanke um die Evaluierung der verschiedenen Ansätze zur Gewährleistung von Typsicherheit in Bezug auf den Austausch von Daten zwischen einem Client, einem Server und der dazugehörigen Datenbank, bei einer bereits bestehenden Applikation.  Da bereits ein Typsystem besteht, können sich verschiedene Resultate im laufe der Arbeit herauskristallisieren.

### Vollständige Evaluierungen
Eine vollständige Evaluierungen, würde die Implementierung der beiden Ansätze JSON Api und GraphQL erfordern, um unter anderem anhand des geschriebenen Codes Kenntnisse erlangen zu können, die sich z.B. durch das lesen der Dokumentationen nicht  direkt manifestieren. Hierbei müsste ein Kompromiss geschlossen werden hinsichtlich der Vollständigkeit beider Implementierungen, weil es den Rahmen einer Bachelorarbeit sprengen würde.

### Evaluierung bis Zeitpunkt X
Die Evaluierung bis zu einem bestimmten Zeitpunkt bezieht sich lediglich auf die Auswertung von Dokumentationen, Projekten, Artikeln, Meinung etc., jedoch nicht auf eine eigene Implementierung. Ab dem Zeitpunkt X muss die Entscheidung getroffen werden für welchen Ansatz eine vollständige Implementierung ausgearbeitet werden soll. Zur Auswahl stehen hierbei folgende Ansätze:
1. GraphQL
2. JSON Api
3. Optimierung des bestehenden Ansatzes

Hierbei können zwei Szenarien eintreten.

#### Erfolg
Bei einer erfolgreichen Implementierung steht die Bewertung des Ergebnisses im Vordergrund. Es wird also angenommen das es sich dann um eine valide Lösung handelt, die im weiteren bestehen der Applikation genutzt wird. 

#### Misserfolg
Sollte bei der vollständigen Implementierung auffallen, dass der gewählte Ansatz keine Option ist bzw. zu keinem validen Ergebnis führt, ist die Begründung weshalb der gewählte Ansatz keine Option ist und daraus resultierende neue Handlungsempfehlungen der Grundstein der Arbeit.
