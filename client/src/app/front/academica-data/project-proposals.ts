/**
 * Inspiration for a task that could be fulfilled by a student in an
 * academic project (thesis, seminar, ...)
 */
export interface ProjectProposal {
  id: string;
  language: string;
  title: string;
  text: string;
  tools: string;
}

export const ProjectProposals: ProjectProposal[] = [
  {
    id: "visual-database-editor",
    language: "de",
    title: "Visueller Drag & Drop Editor für Datenbanken",
    text: `
          <p>
          Aufbauend auf der <a href="http://files.blattwerkzeug.de/theses/marco-pawlowski-thesis-schema-editor.pdf"> Bachelor-Thesis von Marco Pawloski</a> soll ein Datenbank - Editor mit Drag & Drop - Funktionalität entwickelt werden. Die visuelle Gestaltung und die Benutzerführung kann sich dabei gerne an etablierten Tools wie der <a href="https://www.mysql.com/products/workbench/">MySQL - Workbench</a> oder <a href="https://www.pgmodeler.com.br/">pgModeler</a> orientieren. Allerdings müssen die speziellen Anforderungen der Zielgruppe (Schüler und deren Lehrer) explizit berücksichtigt werden.
          </p>`,
    tools: "TypeScript mit Angular",
  },
  /*
  {
    id: "trucklino-world-editor",
    language: "de",
    title: "2D Welt-Editor für Trucklino",
    text: `
      <p>
        Aufbauend auf der Bachelor-Thesis von Sebastian Popp soll ein Welt-Editor für Trucklino entwickelt werden. Bisher müssen Welten für Trucklino sehr umständlich als <code>JSON</code>-Dokument beschrieben werden. Der eingebaute block-basierte Editor wird für die textuelle Visualisierung von Syntaxbäumen entwickelt und eignet sich demenentsprechend nicht für die besser geeignete 2D-Kacheldarstellung.
      </p>
      <p>
        Im Rahmen dieses Projektes soll daher ein browserbasierter 2D-Editor entwickelt werden, mit dem sich die Tiles und die verschiedenen Objekte in der Welt platzieren lassen. Die wesentliche Herausforderung wird dabei die sinnvolle Integration von Drag-and-Drop-Interaktionen aus Angular heraus in die normale Canvas-API sein.
      </p>`,
    tools: "Typescript mit Angular und <code>canvas</code>-Rendering",
  },
  */
  /*{
    id: "usermanagement",
    language: "de",
    title: "Benutzermanagement",
    text: `
      <p>
       Aktuell sieht die Webseite keinerlei Registrierung von Benutzern vor, stattdessen hat jedes erstellte Projekt gewissermaßen eine eigene Benutzerdatenbank. Dieser Umstand soll sich im Rahmen dieses Projektes ändern. Dabei ist die eigentliche Registrierung und Verwaltung von Benutzern mehr eine technische Formalität und nicht besonders herausfordernd. Viel interessanter sind die besonderen Anforderungen, die sich aus dem Einsatz an Schulen ergeben. Registrierte Benutzer fallen dabei typischerweise in eine von drei Rollen: Schüler, Lehrer oder Administrator.
      </p>`,
    tools: "Ruby on Rails für das serverseitige Datenmodell und Angular mit Typescript für die Verwaltung im Frontend.",
  },
  {
    id: "usermanagement",
    language: "en",
    title: "User Management",
    text: `
      <p>
      Currently, the website does not provide any registration of users, instead, each created project, so to speak, has its own user database. This circumstance should change as part of this project. The actual registration and administration of users is more a technical formality and not particularly challenging. Much more interesting are the special requirements that result from the use in schools. Registered users typically fall into one of three roles: student, teacher, or administrator.
      </p>`,
    tools: "Ruby on Rails for the server-side data model and Angular with Typescript for management in the frontend.",
  },*/
  {
    id: "regex-course",
    language: "de",
    title: "Kurs für Reguläre Ausdrücke",
    text: `
      <p>
        Reguläre Ausdrücke lassen sich vergleichsweise gut anhand von Beispielen erläutern. Man präsentiert
        dem Nutzer bestimmte Ausdrücke und Eingaben und führt ihn so schrittweise ein. Das kommerzielle Angebot
        <a href="https://www.executeprogram.com/">"Execute Program"</a> zeigt sehr schön, wie ein solcher
        Kurs aussehen könnte.
      </p>
      <p>
        Um ähnliche Ansätze in BlattWerkzeug zu ermöglichen, bedarf es zunächst der Definition und Implementierung
        von Regulären Ausdrücken an sich. Dabei soll natürlich nicht der gesamte mögliche Sprachumfang abgebildet
        werden, sondern ein sorgsam gewählter Satz an didaktisch sinnvollen Funktionalitäten.
        Die implementierte Sprache soll dann im Rahmen einer interaktiven Test-Umgebung zum Einsatz kommen.
        Dem Anwender werden eine Reihe von beispielhaften Eingaben samt erwartetem Ergebnis vorgegeben. Mittels
        des generierten Block-Editors soll er dazu einen Ausdruck bauen, der alle Testfälle erfüllt.
      </p>`,
    tools: "BlattWerkzeug-Sprachdefinitionen, TypeScript mit Angular"
  },
  {
    id: "teacher-backend",
    language: "de",
    title: "Konzeption & initiale Implementierung eines Backends für Lehrer",
    text: `
      <p>
        Aktuell ist die Benutzerverwaltung von BlattWerkzeug noch sehr rudimentär und keinesfalls auf die
        Bedürfnisse von Lehrern ausgerichtet. Es fehlen vor allem Werkzeuge zur Verwaltung von ganzen
        Gruppen an Benutzern. Dabei ist jedoch aktuell noch fast völlig undefiniert, wie der Umgang von
        Schülern und Lehrern genau zu gestalten ist. Mindestens sollten Lehrer in der Lage sein, mehrere
        Schüler auf einmal einzuschreiben und diesen auch Projekte vorzugeben.
      </p>
      <p>
        Darüber hinaus stellt sich vor allem die Frage, wie Lehrer ihre Projekte sinnvoll an Gruppen von
        Schüler-Nutzern weitergeben können. Problematisch ist vornehmlich, dass die Projekte häufig einen
        Kern an recht statischen Inhalten wie Datenbanken haben. Es ist prinzipiell zwar möglich, wenn auch
        ineffizient, diese Daten schlicht zu kopieren. Dann ergeben sich allerdings Probleme, wenn solche
        statischen Daten vom Lehrer aktualisiert werden müssen.
      </p>`,

    tools: "Eigene Konzeption und Recherche, TypeScript mit Angular, Ruby mit Rails",
  },
  {
    id: "community-functions",
    language: "de",
    title: "Community-Funktionen für Schüler",
    text: `
      <p>
        BlattWerkzeug soll in einem überschaubarem Rahmen mit Community-Funktionen ausgestattet werden. Dazu gehören Kommentare zu Projekten, eine Foren-artige Kommunikationsmöglichkeit und persönliche Direktnachrichten. Diese Funktionalität soll allerdings nicht von Grund auf neu entwickelt werden: Der Nutzen steht dabei in keinem Verhältnis zum Aufwand, vor allem weil entsprechende Software schon existiert.
      </p>
      <p>
        Stattdessen sollen bestehende Community-Platformen in Bezug auf ihre Eignung für die Integration evaluiert werden. Ein erster Ausgangspunkt für die Recherche sollten bestehende OpenSource Foren-Programme wie <a href="http://www.discourse.org">Discourse</a> sein, eine Liste mit möglichen Kandidaten findet sich bei <a href="https://github.com/Kickball/awesome-selfhosted#social-networks-and-forums">Awesome Selfhosted</a>. Die schlussendlich gewählte Software soll dann in BlattWerkzeug integriert werden. Dazu gehört mindestens ein gemeinsamer Login und die Integration von Kommentaren zu Projekten. Weitere Aspekte sind abhängig von der ausgewählten Software.
      </p>`,

    tools: "Eigene Konzeption und Recherche, Anbindung der gewählten Software",
  },
  /*
  {
    id: "web-environment",
    language: "de",
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
    tools: "TypeScript (client- und serverseitig), Grammatik-Editor von BlattWerkzeug",
  },
  */
  /*
  {
    id: "code-sandbox",
    language: "de",
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
    tools: "Mandatory Access Control Features des Linux Kernels (AppArmor, SE Linux), Docker",
  }, */
];