/**
 * Description for the passed data to the AuthDialog
 */
export interface AuthDialogDataDescription {
  // determines which dialog content will be displayed
  type: "signIn" | "signUp";
  // passing a message to the authDialog can be done by the message property
  message?: string;
  // choose between style classes
  // error: alert-danger, warning: alert-warning
  message_type?: "error" | "warning";
}
