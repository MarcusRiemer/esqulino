import { Pipe, PipeTransform } from "@angular/core";
import {
  isProjectUsesBlockLanguageDescription,
  ProjectUsesBlockLanguageDescription,
} from "./project.description";
import { ResourceReferencesService } from "./resource-references.service";

export interface ResourceReference {
  id: string;
  type: "BlockLanguage" | "Grammar" | "CodeResource" | "Project";
}

export function isResourceReference(
  value: unknown
): value is ResourceReference {
  return typeof value === "object" && "id" in value && "type" in value;
}

@Pipe({
  name: "displayResource",
})
export class DisplayResourcePipe implements PipeTransform {
  public constructor(private readonly _resources: ResourceReferencesService) {}

  transform(
    value: ResourceReference | ProjectUsesBlockLanguageDescription
  ): string {
    value = isProjectUsesBlockLanguageDescription(value)
      ? { id: value.blockLanguageId, type: "BlockLanguage" }
      : value;

    const resolved = this.resolve(value);
    return resolved?.name ?? value.id;
  }

  private resolve(value: ResourceReference) {
    switch (value.type) {
      case "BlockLanguage":
        return this._resources.getBlockLanguage(value.id, "undefined");
      default:
        return undefined;
    }
  }
}
