import { Pipe, PipeTransform } from "@angular/core";
import { map, startWith } from "rxjs/operators";
import { Observable, of } from "rxjs";
import {
  isProjectUsesBlockLanguageDescription,
  ProjectUsesBlockLanguageDescription,
} from "./project.description";
import { FetchPolicy } from "@apollo/client/core";

import { NameBlockLanguageGQL } from "../../generated/graphql";

export interface ResourceReference {
  id: string;
  type: "BlockLanguage" | "Grammar" | "CodeResource" | "Project";
}

export function isResourceReference(
  value: unknown
): value is ResourceReference {
  return typeof value === "object" && "id" in value && "type" in value;
}

const FETCH_POLICY: FetchPolicy = "cache-first";

@Pipe({
  name: "displayResource",
})
export class DisplayResourcePipe implements PipeTransform {
  public constructor(
    private readonly _nameBlockLanguage: NameBlockLanguageGQL
  ) {}

  transform(
    value: ResourceReference | ProjectUsesBlockLanguageDescription
  ): Observable<string> {
    value = isProjectUsesBlockLanguageDescription(value)
      ? { id: value.blockLanguageId, type: "BlockLanguage" }
      : value;

    return this.resolve(value);
  }

  private resolve(value: ResourceReference) {
    switch (value.type) {
      case "BlockLanguage":
        return this._nameBlockLanguage
          .fetch({ id: value.id }, { fetchPolicy: FETCH_POLICY })
          .pipe(
            map((res) => {
              return res.data.blockLanguage?.name ?? "???";
            }),
            startWith(value.id)
          );
      default:
        return of(value.id);
    }
  }
}
