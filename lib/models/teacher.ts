import { Schema, model } from 'mongoose';
import { ITeacher } from './interfaces/teacher';

const TeacherSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    contacts: [
      {
        type: String
      }
    ],
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Teacher = model<ITeacher>('Teacher', TeacherSchema);
export default Teacher;
