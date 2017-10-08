# Kleinkram

* Neu: Prototypische Bilderverwaltung
* Neu: Quellenangaben für Daten (+ ggfs. Personen, ...)
* Neu: Portierung auf Rails 5.1
* Neu: Vorschau für Abfrageergebnisse
* Neu: Verschiedene Projektvorschläge
  * Drei Fragezeichen
  * Wikidata Einträge für Personen, Ereignisse, ...

# Wichtig: Universeller Syntaxbaum

* Frage: Umgang mit Fehlermeldungen für "sequence" und "allowed"
  * Problemfall Sequenz: 1 + + 1
                             ^ ^
                             | |
                             Zahl erwartet
                               |
                               Unerwartetes Element

  * Problemfall "allowed": SELECT *, *
                           ^
                           |
                           Nur ein "*" Erlaubt

  
