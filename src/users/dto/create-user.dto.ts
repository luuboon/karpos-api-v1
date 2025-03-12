enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export class CreateUser {
  email: string;
  password: string;
  role: 'patient' | 'doctor';
}
