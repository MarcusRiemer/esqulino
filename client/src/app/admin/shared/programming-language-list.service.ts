import { Injectable } from "@angular/core";

import { Observable, of } from "rxjs";

import { ProgrammingLanguageListDescription } from "./programming-language.description";
import { AvailableLanguages } from "../../shared";

@Injectable()
export class ListProgrammingLanguagesService {
  readonly programmingLanguages$: Observable<
    ProgrammingLanguageListDescription[]
  > = of(
    Object.values(AvailableLanguages).map((l) => {
      return {
        id: l.programmingLanguageId,
        name: l.name,
      };
    })
  );
}
