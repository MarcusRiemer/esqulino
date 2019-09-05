/**
 * To sign up, an e-mail, username and password are required. 
 * The data will be sent to the server.
 */
export interface SignUpDescription {
  email: string;
  username: string;
  password: string;
}

/**
 * To sign in, an email and password are required.
 * The data will be sent to the server.
 */
export interface SignInDescription {
  email: string;
  password: string;
}

/**
 * The data of the description is used for a password
 * change and sent to the server with an HTTP request.
 */
export interface ChangePasswordDescription {
  currentPassword: string;
  newPassword: string;
}

/*
  Description for the passed data to the AuthDialog
*/
export interface AuthDialogDataDescription {
  // determines which dialog content will be displayed
  type: "signIn" | "signUp";
  // passing a message to the authDialog can be done by the message property 
  message?: string;
  // choose between style classes 
  // error: alert-danger, warning: alert-warning
  message_type?: "error" | "warning"
}
