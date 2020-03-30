import { BasePerformData } from "./base";
import { MayPerformRequestDescription } from "../../may-perform.description";

export class ResourcesData extends BasePerformData {
  public update(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "update",
    };
  }

  public create(): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      policyAction: "create",
    };
  }

  public delete(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "destroy",
    };
  }
}
