import { Schema, model } from 'mongoose';
import { IPeriod } from './interfaces/period';

const PeriodSchema = new Schema(
  {
    day: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject'
    }
  },
  {
    timestamps: true
  }
);

const Period = model<IPeriod>('Period', PeriodSchema);
export default Period;
