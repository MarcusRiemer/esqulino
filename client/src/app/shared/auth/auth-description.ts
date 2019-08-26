export interface SignUpDescription {
  email: string;
  username: string;
  password: string;
}

export interface SignInDescription {
  email: string;
  password: string;
}

export interface ChangePasswordDescription {
  currentPassword: string;
  newPassword: string;
}
/*
  Description for the data to be passed
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
