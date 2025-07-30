export interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  focusColor?: string;
}

export interface AuthFooterProps {
  linkText: string;
  linkTo: string;
  linkLabel: string;
  linkColor?: string;
  additionalText?: string;
}