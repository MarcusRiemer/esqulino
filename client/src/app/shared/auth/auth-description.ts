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

export interface AuthDialogDataDescription {
  message: string;
  type: "error" | "warning"
}
