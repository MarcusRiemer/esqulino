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

  async transform(
    value: ResourceReference | ProjectUsesBlockLanguageDescription
  ): Promise<string> {
    value = isProjectUsesBlockLanguageDescription(value)
      ? { id: value.blockLanguageId, type: "BlockLanguage" }
      : value;

    const resolved = await this.resolve(value);
    return resolved?.name ?? value.id;
  }

  private async resolve(value: ResourceReference) {
    switch (value.type) {
      case "BlockLanguage":
        return await this._resources.getBlockLanguage(value.id, "undefined");
      default:
        return undefined;
    }
  }
}
