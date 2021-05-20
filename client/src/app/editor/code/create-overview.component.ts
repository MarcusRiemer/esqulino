import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import { AvailableLanguages } from "../../shared";
import { ResourceReferencesService } from "../../shared/resource-references.service";

import { ProjectService } from "../project.service";

@Component({
  templateUrl: "./create-overview.component.html",
  styleUrls: ["./create-overview.component.scss"],
})
export class CreateOverviewComponent {
  constructor(
    private readonly _currentProject: ProjectService,
    private readonly _references: ResourceReferencesService
  ) {}

  showCreateLanguage$: Observable<boolean> =
    this._currentProject.activeProject.pipe(
      switchMap(async (p) => {
        const blockLanguages = await Promise.all(
          p.usesBlockLanguages.map((b) =>
            this._references.getBlockLanguage(b.blockLanguageId)
          )
        );

        console.log(blockLanguages);
        return blockLanguages.some(
          (b) =>
            b.defaultProgrammingLanguageId ===
            AvailableLanguages.MetaGrammar.programmingLanguageId
        );
      })
    );
}
