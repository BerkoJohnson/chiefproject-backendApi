import { Document } from 'mongoose';
import { IStudent } from './student';
import { ISubject } from './subject';
import { IPayment } from './payment';

export interface IRegistration extends Document {
  student: IStudent;
  month: string;
  subjects: ISubject[];
  payments?: IPayment[];
  createdAt?: Date;
  updatedAt?: Date;
}
