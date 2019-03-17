import { Component, Inject, LOCALE_ID } from '@angular/core'
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
  degree?: string
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
        <p>
         Aktuell sieht die Webseite keinerlei Registrierung von Benutzern vor, stattdessen hat jedes erstellte Projekt gewissermaßen eine eigene Benutzerdatenbank. Dieser Umstand soll sich im Rahmen dieses Projektes ändern. Dabei ist die eigentliche Registrierung und Verwaltung von Benutzern mehr eine technische Formalität und nicht besonders herausfordernd. Viel interessanter sind die besonderen Anforderungen, die sich aus dem Einsatz an Schulen ergeben. Registrierte Benutzer fallen dabei typischerweise in eine von drei Rollen: Schüler, Lehrer oder Administrator.
        </p>`,
      tools: "Ruby on Rails für das serverseitige Datenmodell und Angular mit Typescript für die Verwaltung im Frontend."
    },
    {
      id: "community-functions",
      title: "Community-Funktionen für Schüler",
      text: `
        <p>
          BlattWerkzeug soll in einem überschaubarem Rahmen mit Community-Funktionen ausgestattet werden. Dazu gehören Kommentare zu Projekten, eine Foren-artige Kommunikationsmöglichkeit und persönliche Direktnachrichten. Diese Funktionalität soll allerdings nicht von Grund auf neu entwickelt werden: Der Nutzen steht dabei in keinem Verhältnis zum Aufwand, vor allem weil entsprechende Software schon existiert.
        </p>
        <p>
          Stattdessen sollen bestehende Community-Platformen in Bezug auf ihre Eignung für die Integration evaluiert werden. Ein erster Ausgangspunkt für die Recherche sollten bestehende OpenSource Foren-Programme wie <a href="http://www.discourse.org">Discourse</a> sein, eine Liste mit möglichen Kandidaten findet sich bei <a href="https://github.com/Kickball/awesome-selfhosted#social-networks-and-forums">Awesome Selfhosted</a>. Die schlussendlich gewählte Software soll dann in BlattWerkzeug integriert werden. Dazu gehört mindestens ein gemeinsamer Login und die Integration von Kommentaren zu Projekten. Weitere Aspekte sind abhängig von der ausgewählten Software.
        </p>`,

      tools: "Eigene Konzeption und Recherche, Anbindung der gewählten Software"
    },
    {
      id: "web-environment",
      title: "Web-Umgebung",
      text: `
        <p>
          Ein Prototyp der Entwicklungsumgebung hat Anwender schon in die Lage versetzt, direkt aus dem Webbrowser heraus eigene Webseiten zu entwickeln.Mit der Umstellung auf eine neue Art und Weise die Blocksprachen zu definieren, ist dieser Funktionsumfang zunächst wieder entfallen.Im Rahmen dieser Aufgabe soll eine Möglichgeit zum Bearbeiten und anschauen von Webseiten re- implementiert werden. Von dem mittlerweile abgeschalteten Prototyp existiert neben dem rechtsstehenden Screenshot noch ein Video, welches gerne zur Inspiration genutzt werden kann.
        </p>

        <p>
           Die erstellten Webseiten sollen auf den SQL - Datenbestand eines Projekts zugreifen können und müssen dementsprechend dynamisch über eine Templatingsprache erzeugt werden.Inhaltlich ergeben sich bei dieser Aufgabe unter anderem die folgenden Fragestellungen:
       </p>

       <ul>
         <li>Welche HTML - Elemente sind für Schüler relevant?</li>
         <li>Welche Templatingsprache sollte verwendet werden?</li>
         <li>Wie kann eine Seite die Datenquellen angeben, die zur Darstellung benötigt werden?</li>
         <li>Wie können Formulardaten verarbeitet werden?</li>
       </ul>`,
      tools: "Typescript (client- und serverseitig), Grammatik-Editor von BlattWerkzeug"
    },
    {
      id: "visual-database-editor",
      title: "Visueller Drag & Drop Editor für Datenbanken",
      text: `
            <p>
            Aufbauend auf der Bachelor - Thesis von Marco Pawloski soll ein Datenbank - Editor mit Drag & Drop - Funktionalität entwickelt werden. Die visuelle Gestaltung und die Benutzerführung kann sich dabei gerne an etablierten Tools wie der <a href="https://www.mysql.com/products/workbench/">MySQL - Workbench</a> oder <a href="https://www.pgmodeler.com.br/">pgModeler</a> orientieren. Allerdings müssen die speziellen Anforderungen der Zielgruppe (Schüler und deren Lehrer) explizit berücksichtigt werden.
            </p>`,
      tools: "TypeScript mit Angular"
    },
    {
      id: "code-sandbox",
      title: "Umgebung zur Ausführung von nicht vertrauenswürdigen Programmen",
      text: `
        <p>
          Es liegt in der Natur von BlattWerkzeug, dass prinzipiell beliebigen Personen die Ausführungen ihrer Programme auf dem BlattWerkzeug-Server gestattet werden muss. Und weil nicht jede beliebige Person vertrauenswürdig ist, müssen diese Programme vom restlichen System isoliert werden. Mögliche Mechanismen existieren dafür in großer Zahl, anders wären Webhosting-Dienste oder Online-Compiler wie <a href="https://ideone.com/">ideone.com</a> schließlich überhaupt nicht denkbar.
        </p>
        <p>
          Im Rahmen dieses Projektvorschlags soll untersucht werden:
          <ul>
            <li>Welche Isolationsmechaniken lassen sich für den BlattWerkzeug-Server sinnvoll anwenden? Angedacht sind klassische Linux-Benutzerrechte, AppArmor oder möglicherweise auch Docker.</li>
            <li>Welche Lücken nutzen bösartige Programme klassischerweise aus?</li>
          </ul>
        </p>
        <p>
         Dazu sollen eigens geschriebene, bösartige Programme in einer Testsuite zusammengefasst und (möglichst) mit den gewählten Isolationsverfahren korrekt eingeschränkt werden. Die Bandbreite umfasst dabei schlicht schädliche Skripten (<code>rm -rf /</code>), triviale Versuche Passwörter auszulesen (<code>cat /etc/shadow</code>), über (BitCoin-)Miner (oder profane Endlosschleifen) bis hin zu Versuchen, einen <q>Command and Control</q>-Server aufzusetzen.
        </p>`,
      tools: "Mandatory Access Control Features des Linux Kernels (AppArmor, SE Linux), Docker"
    },
    {
      id: "trucklino-world-editor",
      title: "2D Welt-Editor für Trucklino",
      text: `
        <p>
          Bisher müssen Welten für Trucklino sehr umständlich als <code>JSON</code>-Dokument beschrieben werden. Der eingebaute block-basierte Editor wird für die textuelle Visualisierung von Syntaxbäumen entwickelt und eignet sich demenentsprechend nicht für die besser geeignete 2D-Kacheldarstellung.
        </p>
        <p>
          Im Rahmen dieses Projektes soll daher ein browserbasierter 2D-Editor entwickelt werden, mit dem sich die Tiles und die verschiedenen Objekte in der Welt platzieren lassen.
        </p>`,
      tools: "Typescript mit Angular und <code>canvas</code>-Rendering"
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
      url: `${THESIS_BASE_URL}/sebastian-popp-thesis-trucklino.pdf`,
      abstract: `<p>Klassische Universalsprachen wie Java oder Python haben einen sehr großen Sprachumfang und sind daher nur bedingt zur Einführung in die Konzepte der Programmierung geeignet. Diese Arbeit implementiert eine Minisprache – eine im Sprachumfang reduzierte Programmiersprache – welche es den Schülern ermöglichen soll, spielerisch Programmieren zu lernen, indem ihre Programme einen Lastwagen durch eine Welt steuern und dadurch Aufgaben lösen.</p>`,
      date: new Date('Februar 13, 2019')
    },
    {
      id: "riemer-dissertation-project",
      title: "Generierung von syntaxfreien Entwicklungsumgebungen",
      subtitle: "für beliebige Programmiersprachen",
      author: {
        name: "Marcus Riemer"
      },
      institutionLogo: LOGO_FHW_URL,
      url: `${THESIS_BASE_URL}/marcus-riemer-project-ide-generation.pdf`,
      abstract: `<p>Im Rahmen dieser Promotion soll erforscht und demonstriert werden, wie sich aus formalen Beschreibungen von Programmiersprachen benutzerfreundliche syntaxfreie Entwicklungsumgebungen erzeugen lassen. Letztendlich soll Lehrkräften ein Werkzeug an die Hand gegeben werden, welches die Einstiegshürde in die Programmierung mit konventionellen Programmiersprachen wie SQL, HTML, CSS oder JavaScript senkt.</p>`,
      date: new Date('December 1, 2018')
    }
  ]

  readonly theses: Observable<Thesis[]> = of(this._theses.sort((a, b) => b.date.getTime() - a.date.getTime()));
}
