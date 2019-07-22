import { Schema, model } from 'mongoose';
import { IStudent } from './interfaces/student';

const StudentSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true
    },
    contacts: [
      {
        type: String
      }
    ],
    guardian: {
      name: { type: String },
      contacts: [{ type: String }]
    },
    date_registered: {
      type: Date,
      default: new Date()
    },
    registrations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Registration'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Student = model<IStudent>('Student', StudentSchema);
export default Student;
