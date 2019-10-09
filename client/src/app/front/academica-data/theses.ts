const LOGO_FHW_URL = "/vendor/logos/fhw.svg";
const LOGO_PTL_URL = "/vendor/logos/ptl.svg";
const LOGO_CAU_URL = "/vendor/logos/cau.png";

/**
 * For the moment there is no reason to grab the thesis information from
 * any dynamic third party service or server.
 */
const THESIS_BASE_URL = "http://files.blattwerkzeug.de/theses";

export default [
  {
    id: "origin",
    language: "de",
    title: "BlattWerkzeug",
    subtitle: "Eine datenzentrierte Entwicklungsumgebung für den Schulunterricht",
    author: {
      name: "Marcus Riemer"
    },
    publicationType: "Thesis (M.Sc.)",
    institutionLogo: LOGO_FHW_URL,
    url: `${THESIS_BASE_URL}/marcus-riemer-thesis-blattwerkzeug.pdf`,
    abstract: `
<p>
Konventionelle Entwicklungsumgebungen sind speziell auf die Bedürfnisse von professionellen Anwendern zugeschnittene Programme. Aufgrund der damit verbundenen Komplexität sind sie aus didaktischer Sicht nicht für die Einführung in die Programmierung geeignet. Diese Thesis beschreibt daher ein Konzept und die prototypische Implementierung einer Lehr-Entwicklungsumgebung für Datenbanken und Webseiten namens BlattWerkzeug.
</p>
<p>
Um syntaktische Fehler während der Programmierung systematisch auszuschließen, werden die Bestandteile der dafür benötigten Programmier- oder Textauszeichnungssprachen ähnlich wie in der Lehrsoftware „Scratch“ grafisch durch Blockstrukturen repräsentiert. Diese Blöcke lassen sich über Drag &amp; Drop-Operationen miteinander kombinieren, die syntaktischen Strukturen von SQL und HTML sind für Lernende dabei stets sichtbar, müssen aber noch nicht verinnerlicht werden. So lassen sich auch ohne die manuelle Eingabe von Codezeilen eigene Webseiten programmieren, welche dann im Freundes- und Bekanntenkreis weitergegeben werden können. Für den Unterrichtseinsatz ist der aktuelle Entwicklungsstand von BlattWerkzeug allerdings noch nicht geeignet, er dient vornehmlich der Erprobung und Demonstration der erdachten Konzepte.
</p>`,
    date: new Date('October 31, 2016')
  },
  {
    id: "origin",
    language: "en",
    title: "BlattWerkzeug",
    subtitle: "A data-centric development environment for school education",
    author: {
      name: "Marcus Riemer"
    },
    publicationType: "Thesis (M.Sc.)",
    institutionLogo: LOGO_FHW_URL,
    url: `${THESIS_BASE_URL}/marcus-riemer-thesis-blattwerkzeug.pdf`,
    abstract: `
    <p>
    Conventional development environments are programs specifically tailored to the needs of professional users. Due to the complexity involved, they are not suitable for introduction to programming from a didactic point of view. This thesis therefore describes a concept and the prototypical implementation of a teaching development environment for databases and websites called BlattWerkzeug.
    </p>
    <p>In order to systematically exclude syntactical errors during programming, the components of the programming or text marking languages ​​required for this are represented graphically by block structures, similar to the teaching software "Scratch". These blocks can be accessed via Drag & amp; Combining drop operations, the syntactic structures of SQL and HTML are always visible to learners, but they do not have to be internalized yet. Thus, even without the manual input of lines of code own web pages can be programmed, which can then be passed on in the circle of friends and acquaintances. For teaching purposes, however, the current state of development of BlattWerkzeug is not yet suitable, it serves primarily the testing and demonstration of the conceived concepts.
    </p>`,
    date: new Date('October 31, 2016')
  },
  {
    id: "goergen-mittelstufe",
    language: "de",
    title: "Einführung von Datenbanken in der Mittelstufe",
    subtitle: "unter Verwendung von esqulino",
    author: {
      name: "Stefan Görgen"
    },
    institutionLogo: LOGO_CAU_URL,
    publicationType: "Thesis (B.A.)",
    url: `${THESIS_BASE_URL}/stefan-görgen-thesis-db-mittelstufe.pdf`,
    abstract: `<p>Erarbeitung einer Unterrichtseinheit zu Datenbanken in der Mittelstufe.</p>`,
    date: new Date('October 14, 2016')
  },
  {
    id: "pawlowski-schema",
    language: "de",
    title: "Entwicklung eines Datenbankschemaeditors",
    subtitle: "für den Einsatz im Schulunterricht",
    author: {
      name: "Marco Pawlowski"
    },
    institutionLogo: LOGO_FHW_URL,
    publicationType: "Thesis (B.Sc.)",
    url: `${THESIS_BASE_URL}/marco-pawlowski-thesis-schema-editor.pdf`,
    abstract: `
<p>Mit dieser Arbeit wird eine Lernsoftware entwickelt, die an Anfänger gerichtet ist. Es werden die elementaren Funktionen zur Erstellung von Datenbanken zur Verfügung gestellt werden. Dabei sollen Fehler nicht von der Software automatisch gelöst werden, sondern an den Benutzer kommuniziert werden. Dadurch soll der Benutzer ein Verständnis dafür entwickeln, welche Bedingungen vorher erfüllt sein müssen, um bestimmte Aktionen durchzuführen zu können.</p>`,
    date: new Date('May 2, 2016')
  },
  {
    id: "just-images",
    language: "de",
    title: "Verwaltung und Integration von Bildern",
    subtitle: "Implementierung und rechtliche Aspekte",
    author: {
      name: "Ole Just"
    },
    institutionLogo: LOGO_FHW_URL,
    publicationType: "Thesis (B.Sc.)",
    url: `${THESIS_BASE_URL}/ole-just-thesis-images.pdf`,
    abstract: `<p>SQLino ist eine webbasierte IDE für HTML und SQL auf Einsteigerniveau. Diese Arbeit beschreibt die Entwicklung einer prototypischen Bildverwaltung für SQLino, die neben der bloßen Speicherung und Einbettung der Bilder in die erstellen Webseiten auch rechtliche Aspekte im Umgang mit der Veröffentlichung von Bildern beachtet.</p>`,
    date: new Date('October 31, 2017')
  },
  {
    id: "popp-trucklino",
    language: "de",
    title: "Konzeption und Implementierung einer visuellen Lernumgebung",
    subtitle: "zur spielerischen Einführung in die Programmierung",
    author: {
      name: "Sebastian Popp"
    },
    institutionLogo: LOGO_FHW_URL,
    publicationType: "Thesis (B.Sc.)",
    url: `${THESIS_BASE_URL}/sebastian-popp-thesis-trucklino.pdf`,
    abstract: `<p>Klassische Universalsprachen wie Java oder Python haben einen sehr großen Sprachumfang und sind daher nur bedingt zur Einführung in die Konzepte der Programmierung geeignet. Diese Arbeit implementiert eine Minisprache – eine im Sprachumfang reduzierte Programmiersprache – welche es den Schülern ermöglichen soll, spielerisch Programmieren zu lernen, indem ihre Programme einen Lastwagen durch eine Welt steuern und dadurch Aufgaben lösen.</p>`,
    date: new Date('Februar 13, 2019')
  },
  {
    id: "riemer-dissertation-project",
    language: "de",
    title: "Generierung von syntaxfreien Entwicklungsumgebungen",
    subtitle: "für beliebige Programmiersprachen",
    author: {
      name: "Marcus Riemer"
    },
    institutionLogo: LOGO_FHW_URL,
    url: `${THESIS_BASE_URL}/marcus-riemer-project-ide-generation.pdf`,
    abstract: `<p>Im Rahmen dieser Promotion soll erforscht und demonstriert werden, wie sich aus formalen Beschreibungen von Programmiersprachen benutzerfreundliche syntaxfreie Entwicklungsumgebungen erzeugen lassen. Letztendlich soll Lehrkräften ein Werkzeug an die Hand gegeben werden, welches die Einstiegshürde in die Programmierung mit konventionellen Programmiersprachen wie SQL, HTML, CSS oder JavaScript senkt.</p>`,
    date: new Date('December 1, 2018')
  },
  {
    id: "authentication-authorisation",
    language: "de",
    title: "Implementierung von Authentifizierung und Autorisierung",
    subtitle: "in eine bereits vorhandene Webanwendung",
    author: {
      name: "Tom Hilge"
    },
    publicationType: "PTL Abschlussarbeit",
    institutionLogo: LOGO_PTL_URL,
    url: `${THESIS_BASE_URL}/tom-hilge-thesis-authorisation-authentication.pdf`,
    abstract: `<p>
      Vor dieser Arbeit war in Blattwerkzeug keine Benutzer-Authentisierung, -Authentifizierung und -Autorisierung implementiert. Dies hat zur Folge, dass zum jetzigen Zeitpunkt jeder Internet-Nutzer dazu autorisiert ist, beliebige Anfragen an den Server zu stellen und ohne spezifische Berechtigungs-Überprüfung Serverfunktionen auszuführen. Desweiteren sind Bereiche wie zum Beispiel das Adminpanel über die Seiten-Navigation frei zugänglich.
    </p>
    <p>
      Mit Fertigstellung der Thesis ist es möglich, sich mit einer standardisierten Registrierung oder einem externen Anbieter bei Blattwerkzeug anzumelden. Außerdem werden je nach Benutzerrolle und Benutzergruppe des angemeldeten Nutzers unterschiedlicher Inhalt dargestellt oder andere Operationen gestattet.
    </p>`,
    date: new Date('September 2, 2019')
  }
]