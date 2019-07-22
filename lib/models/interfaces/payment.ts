import { Document } from 'mongoose';
import { IStudent } from './student';
import { ISubject } from './subject';

export interface IPayment extends Document {
  student: IStudent;
  month: string;
  subjects: ISubject[];
  amounts: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
