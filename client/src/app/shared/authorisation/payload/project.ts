import { MayPerformRequestDescription } from "../../may-perform.description";
import { ResourcesData } from "./resources";
export class ProjectPerformData extends ResourcesData {
  constructor() {
    super("Project");
  }

  public storeSeed(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "store_seed",
    };
  }
}
