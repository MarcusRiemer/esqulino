import { Component } from '@angular/core'
import { Observable, of } from 'rxjs'

const LOGO_FHW_URL = "/vendor/logos/fhw.png";
const LOGO_CAU_URL = "/vendor/logos/cau.png";

/** Required front end information for a thesis */
interface Thesis {
  id: string
  title: string
  subtitle: string
  author: {
    name: string
  }
  institutionLogo: string,
  abstract: string
  degree: string
  url: string
  date: Date
}

interface ProjectProposal {
  id: string;
  title: string;
  text: string;
  tools: string;
}

/**
 * For the moment there is no reason to grab the thesis information from
 * any dynamic third party service or server.
 */
const THESIS_BASE_URL = "http://files.blattwerkzeug.de/theses";

/**
 * Knows everything about theses that have been written.
 */
@Component({
  templateUrl: 'templates/academia.html',
})
export class AboutAcademiaComponent {

  readonly projectProposals: ProjectProposal[] = [
    {
      id: "usermanagement",
      title: "Benutzermanagement",
      text: `
<p>Aktuell sieht die Webseite keinerlei Registrierung von Benutzern vor, stattdessen hat jedes erstellte Projekt gewissermaßen eine eigene Benutzerdatenbank. Dieser Umstand soll sich im Rahmen eines Projektes ändern. Dabei ist die eigentliche Registrierung und Verwaltung von Benutzern mehr eine technische Formalität und nicht besonders herausfordernd. Viel interessanter sind die besonderen Anforderungen, die sich aus dem Einsatz an Schulen ergeben:</p>

<ul>
  <li>
    Registrierte Benutzer fallen typischerweise in eine von drei Rollen: Schüler, Lehrer oder Administrator. Dabei ist ein Lehrer für mehrere Schüler zuständig und die Schüler organisieren sich ggfs. in Gruppen (gemäß dem Klassenverband).
  </li>
  <li>
    Lehrer und Administratoren müssen Batch-Operationen vornehmen können. Darunter fällt insbesondere das Anlegen von Projekten für ganze Klassenverbände.
  </li>
</ul>
`,
      tools: "Ruby on Rails für das serverseitige Datenmodell und Angular mit Typescript für die Verwaltung im Frontend."
    },
    {
      id: "web-environment",
      title: "Web-Umgebung",
      text: `
<p>
  Ein Prototyp der Entwicklungsumgebung hat Anwender schon in die Lage versetzt, direkt aus dem Webbrowser heraus eigene Webseiten zu entwickeln. Mit der Umstellung auf eine neue Art und Weise die Blocksprachen zu definieren, ist dieser Funktionsumfang zunächst wieder entfallen. Im Rahmen dieser Aufgabe soll eine Möglichgeit zum Bearbeiten und anschauen von Webseiten re-implementiert werden. Von dem mittlerweile abgeschalteten Prototyp existiert neben dem rechtsstehenden Screenshot noch ein Video, welches gerne zur Inspiration genutzt werden kann.
</p>

<p>
  Die erstellten Webseiten sollen auf den SQL-Datenbestand eines Projekts zugreifen können und müssen dementsprechend dynamisch über eine Templatingsprache erzeugt werden. Inhaltlich ergeben sich bei dieser Aufgabe unter anderem die folgenden Fragestellungen:
</p>

<ul>
  <li>Welche HTML-Elemente sind für Schüler relevant?</li>
  <li>Welche Templatingsprache sollte verwendet werden?</li>
  <li>Wie kann eine Seite die Datenquellen angeben, die zur Darstellung benötigt werden?</li>
  <li>Wie können Formulardaten verarbeitet werden?</li>
</ul>
`,
      tools: "Typescript (client- und serverseitig), Grammatik-Editor von BlattWerkzeug"
    },
    {
      id: "visual-database-editor",
      title: "Visueller Drag & Drop Editor für Datenbanken",
      text: `
<p>
  Aufbauend auf der Bachelor-Thesis von Marco Pawloski soll ein Datenbank-Editor mit Drag & Drop-Funktionalität entwickelt werden. Die visuelle Gestaltung und die Benutzerführung kann sich dabei gerne an etablierten Tools wie der <a href="https://www.mysql.com/products/workbench/">MySQL-Workbench</a> oder <a href="https://www.pgmodeler.com.br/">pgModeler</a> orientieren. Allerdings müssen die speziellen Anforderungen der Zielgruppe (Schüler und deren Lehrer) explizit berücksichtigt werden.
</p>`,
      tools: "TypeScript mit Angular"
    }
  ];

  private _theses: Thesis[] = [
    {
      id: "origin",
      title: "BlattWerkzeug",
      subtitle: "Eine datenzentrierte Entwicklungsumgebung für den Schulunterricht",
      author: {
        name: "Marcus Riemer"
      },
      degree: "Master of Science",
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
      id: "goergen-mittelstufe",
      title: "Einführung von Datenbanken in der Mittelstufe",
      subtitle: "unter Verwendung von esqulino",
      author: {
        name: "Stefan Görgen"
      },
      institutionLogo: LOGO_CAU_URL,
      degree: "Bachelor",
      url: `${THESIS_BASE_URL}/stefan-görgen-thesis-db-mittelstufe.pdf`,
      abstract: `<p>Erarbeitung einer Unterrichtseinheit zu Datenbanken in der Mittelstufe.</p>`,
      date: new Date('October 14, 2016')
    },
    {
      id: "pawlowski-schema",
      title: "Entwicklung eines Datenbankschemaeditors",
      subtitle: "für den Einsatz im Schulunterricht",
      author: {
        name: "Marco Pawlowski"
      },
      institutionLogo: LOGO_FHW_URL,
      degree: "Bachelor",
      url: `${THESIS_BASE_URL}/marco-pawlowski-thesis-schema-editor.pdf`,
      abstract: `
<p>Mit dieser Arbeit wird eine Lernsoftware entwickelt, die an Anfänger gerichtet ist. Es werden die elementaren Funktionen zur Erstellung von Datenbanken zur Verfügung gestellt werden. Dabei sollen Fehler nicht von der Software automatisch gelöst werden, sondern an den Benutzer kommuniziert werden. Dadurch soll der Benutzer ein Verständnis dafür entwickeln, welche Bedingungen vorher erfüllt sein müssen, um bestimmte Aktionen durchzuführen zu können.</p>`,
      date: new Date('May 2, 2016')
    },
    {
      id: "just-images",
      title: "Verwaltung und Integration von Bildern",
      subtitle: "Implementierung und rechtliche Aspekte",
      author: {
        name: "Ole Just"
      },
      institutionLogo: LOGO_FHW_URL,
      degree: "Bachelor",
      url: `${THESIS_BASE_URL}/ole-just-thesis-images.pdf`,
      abstract: `<p>SQLino ist eine webbasierte IDE für HTML und SQL auf Einsteigerniveau. Diese Arbeit beschreibt die Entwicklung einer prototypischen Bildverwaltung für SQLino, die neben der bloßen Speicherung und Einbettung der Bilder in die erstellen Webseiten auch rechtliche Aspekte im Umgang mit der Veröffentlichung von Bildern beachtet.</p>`,
      date: new Date('October 31, 2017')
    },
    {
      id: "popp-trucklino",
      title: "Konzeption und Implementierung einer visuellen Lernumgebung",
      subtitle: "zur spielerischen Einführung in die Programmierung",
      author: {
        name: "Sebastian Popp"
      },
      institutionLogo: LOGO_FHW_URL,
      degree: "Bachelor",
      url: `${THESIS_BASE_URL}/sebastian-popp-trucklino.pdf`,
      abstract: `<p>Klassische Universalsprachen wie Java oder Python haben einen sehr großen Sprachumfang und sind daher nur bedingt zur Einführung in die Konzepte der Programmierung geeignet. Diese Arbeit implementiert eine Minisprache – eine im Sprachumfang reduzierte Programmiersprache – welche es den Schülern ermöglichen soll, spielerisch Programmieren zu lernen, indem ihre Programme einen Lastwagen durch eine Welt steuern und dadurch Aufgaben lösen.</p>`,
      date: new Date('Februar 13, 2019')
    }
  ]

  readonly theses: Observable<Thesis[]> = of(this._theses.sort((a, b) => b.date.getTime() - a.date.getTime()));
}
