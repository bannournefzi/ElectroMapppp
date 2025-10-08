import { Role } from './role.model';
import { CarType } from './car-type.model';

export interface User {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  carType: CarType;
  enabled: boolean;
  accountLocked: boolean;
  roles: Role[];
  creationDate: string;
  lastModifiedDate: string;
  phone?: string;
  password?: string;
  roleValue?: number;
}
