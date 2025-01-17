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
    icon: "github",
    title: {
      de: "Quelltext Einsehen",
      en: "View Sourceode",
    },
    subtitle: {
      de: "Als Git-Repository auf GitHub",
      en: "As Git-repository on GitHub",
    },
    content: {
      de: `Der Quelltext lässt sich sowohl online betrachten als auch mit git ausschecken.`,
      en: `The source code may be browsed online or checked out with git.`,
    },
    href: "https://github.com/MarcusRiemer/blattwerkzeug",
  },
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
      de: `Kompiliert das Projekt noch nach meinem letzten Commit? Laufen die Testfälle noch durch?`,
      en: `Did my last commit break anything for the build? Do the tests still run?`,
    },
    titleBadgeImage:
      "https://dev.azure.com/marcusriemer/BlattWerkzeug/_apis/build/status%2FBlattWerkzeug%20CI?branchName=master",
    href: "https://dev.azure.com/marcusriemer/BlattWerkzeug/_build?definitionId=8",
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
