import { MayPerformRequestDescription } from "../may-perform.description";
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

  public addMember(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "add_member",
    };
  }

  public changeMemberRole(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "change_member_role",
    };
  }

  public changeOwner(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "change_owner",
    };
  }

  public removeMember(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "remove_member",
    };
  }
  public createDeepCopy(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_deep_copy",
    };
  }

  public createAssignment(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_update_assignment",
    };
  }

  public updateAssignment(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_update_assignment",
    };
  }

  public deleteAssignment(resourceId: string): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_update_assignment",
    };
  }

  public deleteAssignmentRequirement(
    resourceId: string
  ): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "destroy_assignment_required_code_resource",
    };
  }

  public removeAssignmentRequiredSolution(
    resourceId: string
  ): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "destroy_assignment_required_code_resource",
    };
  }

  public createAssignmentRequirements(
    resourceId: string
  ): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_update_assignment_required_code_resource",
    };
  }

  public createAssignmentSubmissionGrade(
    resourceId: string
  ): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_assignment_submission_grade",
    };
  }

  public updateAssignmentRequirements(
    resourceId: string
  ): MayPerformRequestDescription {
    return {
      resourceType: this.resourceType,
      resourceId: resourceId,
      policyAction: "create_update_assignment_required_code_resource",
    };
  }
}
