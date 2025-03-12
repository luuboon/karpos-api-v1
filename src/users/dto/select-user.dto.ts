enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export class SelectUser {
  id?: number;
  email?: string;
  password?: string;
  role?: 'patient' | 'doctor';
}
