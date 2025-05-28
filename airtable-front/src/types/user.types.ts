export interface User {
  userID: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  allergies: string[];
  createdAt: string;
}

export interface Allergy {
  allergyID: string;
  name: string;
  description: string;
  severity: 'Léger' | 'Modéré' | 'Sévère';
} 