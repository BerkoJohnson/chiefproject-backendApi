import { Request, Response } from 'express';
import Period from '../models/period';
import { IPeriod } from 'models/interfaces/period';
import { stat } from 'fs';

interface IPeriodToday extends IPeriod {
  status?: 'Not Started' | 'In Progress' | 'Over';
}

export class PeriodController {
  public static async getPeriods(req: Request, res: Response) {
    try {
      const periods = await Period.find().populate({
        path: 'subject',
        select: '-periods -registrations -createdAt -updatedAt'
      });
      res.send(periods);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async getPeriod(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      if (!id) res.status(400).send();
      const periods = await Period.find().populate({
        path: 'subject',
        select: '-periods -registrations -createdAt -updatedAt'
      });
      res.send(periods);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async updatePeriod(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const body: IPeriod = req.body.period;
      if (!body || !id) return res.status(400).send();
      const period = await Period.findByIdAndUpdate(
        id,
        {
          day: body.day,
          time: body.time,
          subject: body.subject
        },
        {
          new: true
        }
      );
      res.status(201).send(period);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async changeDay(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const day: string = req.body.day;
      if (!day || !id) return res.status(400).send();
      const period = await Period.findByIdAndUpdate(
        id,
        {
          day: day
        },
        {
          new: true
        }
      );
      res.status(201).send(period);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async changeTime(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const time: string = req.body.time;
      if (!time || !id) return res.status(400).send();
      const period = await Period.findByIdAndUpdate(
        id,
        {
          time: time
        },
        {
          new: true
        }
      );
      res.status(201).send(period);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async resignPeriod(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const subject: string = req.body.subject;
      if (!subject || !id) return res.status(400).send();
      const period = await Period.findByIdAndUpdate(
        id,
        {
          subject: subject
        },
        {
          new: true
        }
      );
      res.status(201).send(period);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async deletePeriod(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      if (!id) return res.status(400).send();
      await Period.findByIdAndRemove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async today(req: Request, res: Response) {
    try {
      const today: string = req.query.today;
      if (!today) return res.status(400).send();
      const periodsForToday = await Period.find()
        .populate({ path: 'subject', select: '-periods' })
        .where('day', today);

      const weekDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];

      // Get today's day no in JS
      const date = new Date();
      const dayIndex = date.getDay();
      const weekDay = weekDays[dayIndex];
      const requestDayIndex = weekDays.indexOf(today);

      const currentHour = date.getHours();
      const currentMinute = date.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      let periods = periodsForToday.map(period => {
        const time = period.time;
        const timeInMinutes = +time.split(':')[0] * 60 + +time.split(':')[1];
        let status: 'In Progress' | 'Over' | 'Not Started' | 'Unknown' = 'Unknown';

        if (dayIndex < requestDayIndex) {
          status = 'Not Started';
        } else if (dayIndex === requestDayIndex) {
          if (currentTimeInMinutes < timeInMinutes) {
            status = 'Not Started';
          } else if (
            currentTimeInMinutes > timeInMinutes &&
            currentTimeInMinutes < timeInMinutes + 90
          ) {
            status = 'In Progress';
          } else if (currentTimeInMinutes > timeInMinutes + 90) {
            status = 'Over';
          }
        } else {
          status = 'Over';
        }

        return {
          _id: period._id,
          day: period.day,
          time: period.time,
          subject: period.subject,
          createdAt: period.createdAt,
          updatedAt: period.updatedAt,
          status: status
        };
      });
      res.status(200).send(periods);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}
