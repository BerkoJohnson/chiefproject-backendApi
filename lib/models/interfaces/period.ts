import { Document } from 'mongoose';
import { ISubject } from './subject';

export interface IPeriod extends Document {
  day: string;
  time: string;
  subject: ISubject;
  createdAt?: Date;
  updatedAt?: Date;
}
