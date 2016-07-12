import {OpaqueToken} from '@angular/core'

/**
 * This token is used to give widget-editing components access to
 * the edited ... thing. Technically the param has an `any` type,
 * so you need to make sure that whatever is delivered by this
 * token matches your bill.
 */
export const SIDEBAR_MODEL_TOKEN = new OpaqueToken("sidebar.model");

/**
 * This token is used to give widget-editing components access to
 * the page the widget belongs to.
 */
export const WIDGET_PAGE_TOKEN = new OpaqueToken("widget.page");

/**
 * This token is used to give widget components access to the model
 * they should display.
 */
export const WIDGET_MODEL_TOKEN = new OpaqueToken("widget.model");
