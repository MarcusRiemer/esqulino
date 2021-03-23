import { MayPerformRequestDescription } from "../may-perform.description";

import { ResourcesData } from "./resources";

export class BlockLanguagePerformData extends ResourcesData {
  constructor() {
    super("BlockLanguage");
  }

  public storeSeed(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "store_seed",
    };
  }
}
