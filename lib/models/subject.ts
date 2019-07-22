import { Schema, model } from 'mongoose';
import { ISubject } from './interfaces/subject';

const SubjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    periods: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Period'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Subject = model<ISubject>('Subject', SubjectSchema);
export default Subject;
