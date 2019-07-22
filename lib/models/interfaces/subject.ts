import { Document } from 'mongoose';
import { ITeacher } from './teacher';
import { IPeriod } from './period';

export interface ISubject extends Document {
  title: string;
  teacher?: ITeacher;
  periods?: IPeriod[];
  createdAt?: Date;
  updatedAt?: Date;
}
