import { Pipe, PipeTransform } from "@angular/core";
import { map, startWith, take } from "rxjs/operators";
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

/**
 * Attempts to find an automatic way of presenting a user centric
 * version of any kind of reference.
 */
@Pipe({
  name: "displayResource",
  pure: true,
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
            startWith(value.id),
            take(2)
          );
      default:
        return of(value.id);
    }
  }
}
