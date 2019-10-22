import { MayPerformRequestDescription } from './../../may-perform.description';
import { BasePerformData } from './base';

export class SettingsPerformData extends BasePerformData {
  constructor() { super(); }
  
  public changeUsername(): MayPerformRequestDescription {
    return ({
      resourceType: "User",
      policyAction: "change_username"
    })
  }

  public changePrimaryEmail(): MayPerformRequestDescription {
    return ({
      resourceType: "User",
      policyAction: "send_change_email"
    })
  }

  public changePassword(): MayPerformRequestDescription {
    return ({
      resourceType: "PasswordIdentity",
      policyAction: "change_password"
    })
  }

  public listProviders(): MayPerformRequestDescription {
    return ({
      resourceType: "Identity",
      policyAction: "list"
    })
  }

  public linkedIdentities(): MayPerformRequestDescription {
    return ({
      resourceType: "Identity",
      policyAction: "show"
    })
  }
}