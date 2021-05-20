import { Component } from "@angular/core";
import { of } from "rxjs";

import { KnownLangString } from "../shared/multilingual-string.description";
import { CurrentLocaleService } from "../current-locale.service";

import { ProjectProposals } from "./academica-data/project-proposals";

interface DevelopmentLink {
  icon: string;
  title: KnownLangString;
  titleBadgeImage?: string;
  subtitle: KnownLangString;
  href: string;
  content: KnownLangString;
}

// Online resources where development happens
const DevelopmentLinks: DevelopmentLink[] = [
  {
    icon: "bitbucket",
    title: {
      de: "Quelltext Einsehen",
      en: "View Sourceode",
    },
    subtitle: {
      de: "Als Git-Repository bei BitBucket",
      en: "As Git-repository on BitBucket",
    },
    content: {
      de: `Der Quelltext lässt sich sowohl online betrachten als auch mit git ausschecken.`,
      en: `The source code may be browsed online or checked out with git.`,
    },
    href: "https://bitbucket.org/marcusriemer/esqulino/",
  },
  /*{
    icon: "trello",
    title: {
      "de": "Feature-Planung",
      "en": "Feature-Planning"
    },
    subtitle: {
      "de": "Als Kanban-Board bei Trello",
      "en": "As Kanban-Board at Trello"
    },
    content: {
      "de": `An welchen Features wird gerade gearbeitet? Wer macht eigentlich was? Diese organisatorischen Fragen werden mit dem Kanban-Board geklärt.`,
      "en": `Which feature is currently being worked on? Who is working on what? These organisational questions are organised with Trello.`
    },
    href: "https://trello.com/b/vQ5vkMpV/esqulino"
  },*/
  {
    icon: "check-circle-o",
    title: {
      de: "Continous Integration Pipeline",
      en: "Continous Integration Pipeline",
    },
    subtitle: {
      de: "via Azure DevOps und Docker-Images",
      en: "via Azure DevOps and Docker-imaeges",
    },
    content: {
      de: `Kompiliert das Projekt noch nach meinem letzten Commit? Laufen die Testfälle noch durch? Der CI-Dienst läuft nach jedem "push" und findet es heraus.`,
      en: `Did my last commit break anything for the build? Do the tests still run? The CI-service runs after every push and finds out.`,
    },
    titleBadgeImage:
      "https://dev.azure.com/marcusriemer/BlattWerkzeug/_apis/build/status/marcusriemer.esqulino?branchName=master",
    href: "https://dev.azure.com/marcusriemer/BlattWerkzeug/_build?definitionId=7",
  },
  {
    icon: "slack",
    title: {
      de: "Entwickler-Kommunikation",
      en: "Development-Communication",
    },
    subtitle: {
      de: "Als Chat bei Slack",
      en: "As Chat on Slack",
    },
    content: {
      de: `Welche akuten Änderungen stehen gerade an? Wie kann ich eigentlich ..? Hinweise und Antworten gibt es im Chat.`,
      en: `Which acute changes are about to happen? How can I ..? Hints and answers are available in chat.`,
    },
    href: "https://join.slack.com/t/blattwerkzeug/shared_invite/zt-gbzwusqo-Mg0G3dhcoHThs6e5Nfx4ww",
  },
];

/**
 * Information for developers that might want to contribute to the project.
 */
@Component({
  templateUrl: "templates/development.html",
})
export class DevelopmentComponent {
  constructor(private readonly _lang: CurrentLocaleService) {}

  readonly projectProposals = of(
    ProjectProposals.filter((p) => p.language === this._lang.localeId)
  );

  readonly developmentLinks = of(DevelopmentLinks);
}
