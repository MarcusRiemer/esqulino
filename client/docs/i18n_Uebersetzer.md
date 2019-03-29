# i18n Dokumentation Übersetzer

## Übersetzung der Übersetzungsdateien (.xlf)
Die Texte der Anwendung werden in XLIFF 1.2 Dateien übersetzt. Die Dateien für die Sprache finden befinden sich im Ordner `src/locale`.

### Übersetzen einer .xlf Datei
Die einzelnen Texte der Anwendung sind in `trans-unit` XML Knoten abgelegt.

Beispiel:
```
<trans-unit id="welcomeMessage" datatype="html">
    <source>Willkommen bei</source>
    <target>Welcome to</target>
    <context-group purpose="location">
        <context context-type="sourcefile">app/front/templates/about.html</context>
        <context context-type="linenumber">3</context>
    </context-group>
    <note priority="1" from="description">welcome message</note>
</trans-unit>
```

Das `source`-Tag beinhaltet dabei den ursprünglichen Text der Deutschen Sprachversion und sollte nicht verändert werden.

Das `target`-Tag enthält den entsprechend übersetzten Text. Bei neuen Knoten ist ggf. kein `target`-Tag vorhanden und muss manuell erstellt werden.

Im `context-group`-Tag befinden sich Informationen darüber, aus welchem Teil der Anwendung der Text stammt. Auch diese Informationen sollten nicht manuell angepasst werden.

Es existieren ggf. `note`-Tags, welche eine "Beschreibung" bzw. eine "Bedeutung" des zu übersetzenden Textes angeben. Diese sollten nicht angepasst werden, und dienen als Kontext-Information.

#### Hinweis: Verschachtelte HTML Elemente
Es kann vorkommen, dass innerhalb eines `source`-Tags ein oder mehrere `<x>`-Tags vorkommen. Diese entstehen, wenn im zu übersetzenden HTML Element noch weitere, verschachtelte HTML Elemente befinden. Es ist wichtig, dass diese `<x>`-Tags auch an der entsprechenden Stelle im `target`-Tag wieder aufgenommen werden.

Beispiel HTML:
```
<p i18n="@@textId">Dieser Text beinhaltet ein <strong>hervorgehobenes</strong> Wort.</p>
```

Resultierendes `source`-Tag in `messages.xlf`:
```
<source>
    Dieser Text beinhaltet ein<x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>hervorgehobenes<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> Wort.
</source>
```

Beispiel für entsprechendes `target`-Tag in messages.en.xlf:
```
<target>
    This text contains a <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>emphasized<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> word.
</target>
```

## Übersetzung der Navigationselemente
Um die Elemente der Navigation zu übersetzen, müssen die Änderungen in der Datei `src/app/front/front.component.ts` vorgenommen werden.

Die `text`-Attribute der einzelnen Navigationselemente bestehen jeweils aus einem Objekt mit jeweils einem Attribut (`de`, `en`, `...`) für jede unterstützte Sprache.

Beispiel:
```
{
    type: "link",
    text: {
        de: "Hauptseite",
        en: "Home",
    },
    route: ["/about/"],
    icon: "home",
},
```


## Übersetzung der Projektvorschläge & wisschenschaftlichen Arbeiten

Die Übersetzung von Projektvorschlägen und wisschenschaftlichen Arbeiten, welche auf als Teil der Komponente `src/app/front/academica.component.ts` dargestellt werden, erfolgt in den Dateien im Ordner `src/app/front/academica-data`.

Sowohl Projektvorschläge (in Datei `project-proposals.ts`) als auch wisschenschaftliche Arbeiten (in Datei `theses.ts`) haben ein Attribut `language`.

Um einen dieser beiden Typen zu übersetzen, kann einfach der ursprüngliche deutsche Eintrag aus `theses.ts` bzw. `project-proposals.ts` kopiert werden, und der Wert für `language` auf eine andere Sprache festgelegt werden.

Beispiel anhand eines Projektvorschlages:
```
[
    // Deutscher Eintrag
    {
        id: "usermanagement",
        language: "de",
        title: "Benutzermanagement",
        text: `Langer Text über Benutzermanagement`,
        tools: "Eingesetzte Tools",
    },

    // Übersetzter englischer Eintrag
    {
        id: "usermanagement",
        language: "en",
        title: "User management",
        text: `Long Text about user management`,
        tools: "used tools"
    }
]
```