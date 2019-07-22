import { Schema, model } from 'mongoose';
import { IRegistration } from './interfaces/registration';

const RegistrationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    month: {
      type: String,
      required: true
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
      }
    ],
    payment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Registration = model<IRegistration>('Registration', RegistrationSchema);
export default Registration;
