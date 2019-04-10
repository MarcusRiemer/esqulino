# i18n Dokumentation Projektleiter

## Übersetzung von HTML Templates
Zur Übersetzung von Texten in HTML Elementen kann das Angular i18n Modul verwendet werden.

### Übersetzung eines HTML Elements
Um HTML Elemente zu übersetzten, muss ein `i18n`-Attribut hinzugefügt werden. Dieses sollte mit einer Angabe `i18n="<Bedeutung>|<Beschreibung>@@<id>"` versehen werden, wobei die Bedeutung sich meistens aus der Beschreibung ergibt, und daher weggelassen werden kann.

Beispiel:
```
<h1 i18n="headline home page@@headlineHomePage">Dies ist eine Überschrift</h1>
```

### Übersetzung eines HTML Attributes
Um ein HTML Attribut übersetzen zu können, muss ebenfalls ein `i18n`-Attribut hinzugefügt werden, welchem mit einem `-` abgetrennt der Name des Attributes angehängt wird (`i18n-<attribute>="<Bedeutung>|<Beschreibung>@@<id>`").

Beispiel:
```
<img src="test.jpg" title="Ein Titel" i18n-title="title of test image@@testImageTitle" />
```

### Text ohne HTML Element übersetzen
Um einen Text ohne umschließendes HTML Element zu übersetzen, kann das Element `<ng-container>` genutzt werden, da dieses als HTML Kommentar gerendert wird und so kein neues Element erzeugt.

Beispiel:
```
<ng-container i18n="...">
    Dieser Text wird ohne umschließendes Element trotzdem übersetzt gerendert.
</ng-container>
```


### Weitere Möglichkeiten des Angular i18n Moduls
Weitere, bisher nicht genutze Möglichkeiten des Angular i18n Moduls, wie z.B. die Übersetzung von Singular und Plural Versionen von Wörtern können der Angular i18n Dokumentation entnommen werden: https://angular.io/guide/i18n

### Übersetzungen von Wisschenschaftlichen Arbeiten & Projektvorschlägen
Um Abschlussarbeiten und Projektvorschläge in der `academica`-Komponente vorzunehmen, müssen folgende Dateien bearbeitet werden:
```
// Projektvorschläge
src/app/front/academica-data/project-proposals.ts

// Wisschenschaftliche Arbeiten
src/app/front/academica-data/theses.ts
```

Für jeden Projektvorschlag und jede wisschenschaftliche Arbeit kann über das Attribut `language` festgelegt werden, welche Sprache der Eintrag hat. Es werden nur Einträge entsprechend der aktuellen Sprache der Anwendung dargestellt.

### Übersetzung von Navigationelementen
Für die Übersetzung von Navigationselementen existiert ein neuer Datentyp `MultiLangString` in der Komponente `front.component.ts`. Dieser Datentyp wird für das `text`-Attribut von `NavLink`, `NavLinkExternal` und `NavHeader` genutzt.

Beispiel für einen NavLink:
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
## Übersetzungsdatei erzeugen
Um die Übersetzungsdatei `messages.xlf` zu erzeugen, muss global das Paket `ngx-i18nsupport` installiert sein, da hierfür das Script `xliffmerge` benötigt wird.

Installieren von ngx-i18nsupport (global):
```
npm i -g @ngx-i18nsupport/ngx-i18nsupport
```

Erzeugen der deutschen Übersetzungsdatei und gleichzeitigem hinzufügen neuer Übersetzungstexte in die bereits bestehenden Übersetzungsdateien für andere Sprachen:
```
npm run extract-i18n
```

Die entstandene Datei `locale/messages.xlf` muss nicht weiter bearbeitet werden. Sie dient als Datenquelle für die Übersetzungsdateien der Zielsprachen z.B. `locale/messages.en.xlf` für Englisch.

## Hinzufügen einer weiteren Sprache
Um dem Projekt eine weitere Sprache hinzuzufügen müssen Änderungen an diversen Stellen vorgenommen werden.

### Anpassungen angular.json
Es muss für jede Sprache eine Build-Konfiguration für das Client- und Server-Bundle hinzugefügt werden.

Beispiel für neue Sprache Französisch:
```
"architect": {
    "build": {
        ...
        "configurations": {
            ...
            "production-fr": {
                "outputPath": "dist/browser/fr",
                ...
                "i18nFile": "src/locale/messages.fr.xlf",
                "i18nFormat": "xlf",
                "i18nLocale": "fr",
                "baseHref": "/fr/"
            }
        }
    }   
}
  
"server": {
    ...
    "configurations": {
        ...
        "fr": {
            "outputPath": "dist/server/fr",
            "i18nFile": "src/locale/messages.fr.xlf",
            "i18nFormat": "xlf",
            "i18nLocale": "fr"
        }
    }
}
``` 

### Anpassungen Makefile
Es muss für jede Sprache ein Client- und Server-Bundle compiliert werden.

```
client-compile : ...
	...
	$(NG_BIN) build --aot --prod --configuration=production-fr $(NG_OPTS)

dist/server.js: ...
	...
	$(NG_BIN) run blattwerkzeug-client:server --configuration=fr
	...
```

### Server Bundle in Server laden
Das neue Server Bundle muss im Server `server.ts` geladen, und in das Array der Verfügbaren Sprach Engines aufgenommen werden.
Beispiel:

```
// import language bundles
...
const frBundle = require('./dist/server/fr/main');

const languageEngines = [
    {
        id: 'fr',
        base: '/fr',
        engine: ngExpressEngine({
            bootstrap: frBundle.AppServerModuleNgFactory,
            providers: [provideModuleMap(enBundle.LAZY_MODULE_MAP)]
        })
    },
...
];
```

### i18n Pipes hinzufügen
Um Datumsangaben und Zahlenwerte entsprechend der aktuellen Sprache der Anwendung darstellen zu können, müssen die entsprechenden Sprachdaten sowohl im Client als auch im Server geladen und registriert werden. Um diesen Vorgang zu vereinfachen, importieren sowohl Client als auch Server die Funktion `registerLanguages()` aus der Datei `locale-registration.ts`. Es sind daher nur folgende Anpassungen an der Datei `locale-registration.ts` notwendig:

```
import localeFr from '@angular/common/locales/fr';

function registerLanguages () {
    ...
    registerLocaleData(localeFr, 'fr');
}
```

### Erweitern von MultiLangString
Das Interface `MultiLangString` in der Datei `front.component.ts` muss für jede Sprache um ein Attribut entsprechend der Sprache erweitert werden.
```
export interface MultiLangString {
  de: string;
  ...
  fr: string;
}
```

### Anpassen der `xliffmerge` Konfiguration
Damit das Script `extract-i18n` auch für die neu hinzugefügte Sprache und deren Übersetzungsdatei berücksichtigt, muss die `xliffmerge.json` Datei angepasst werden.

Die Option `languages` muss um die Sprache Französich erweitert werden.

Beispiel: 
```
{
    "xliffmergeOptions": {
        ...
        "languages": ["en", "fr"],
        ...
    }
}
```
