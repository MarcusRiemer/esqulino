import { InjectionToken } from "@angular/core";

/**
 * This token is used to give widget-editing components access to
 * the edited ... thing. Technically the param has an `any` type,
 * so you need to make sure that whatever is delivered by this
 * token matches your bill.
 */
export const SIDEBAR_MODEL_TOKEN = new InjectionToken("sidebar.model");

/**
 * Tells the sidebar the ID that was assigned to it. This ID is
 * required to close a sidebar.
 */
export const SIDEBAR_ID_TOKEN = new InjectionToken("sidebar.id");
