import { Schema, model } from 'mongoose';
import { IUser } from './interfaces/user';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6
    },
    role: {
      type: String,
      default: 'Normal'
    }
  },
  {
    timestamps: true
  }
);

const User = model<IUser>('User', UserSchema);
export default User;
