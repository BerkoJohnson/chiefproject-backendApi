import { Document } from 'mongoose';
import { IRegistration } from './registration';

export interface IStudent extends Document {
  name: string;
  contacts: string[];
  guardian: {
    name: string;
    contacts: string[];
  };
  date_registered?: Date;
  registrations?: IRegistration;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
