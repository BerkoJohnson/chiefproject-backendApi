import { Request, Response } from 'express';
import Subject from '../models/subject';
import Period from '../models/period';
import { IPeriod } from '../models/interfaces/period';

export class SubjectController {
  public static async getSubject(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const subject = await Subject.findById(id)
       .populate(
         {
           path: 'teacher periods',
           select: '-password -subjects'
         }
       )
      res.send(subject);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  public static async getSubjects(req: Request, res: Response) {
    try {
      const subjects = await Subject.find();
      return res.send(subjects);
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public static async createSubject(req: Request, res: Response) {
    try {
      const title: string = req.body.title;

      // Check if Subject exists
      const subjectSaved = await Subject.findOne({ title });
      if (subjectSaved) return res.status(400).send();
      const subject = new Subject();
      subject.title = title;
      await subject.save();

      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async updateSubject(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      // @TODO validate the title input from the client
      const { title } = req.body;
      const updatedSubject = await Subject.findByIdAndUpdate(id, { title });
      if (updatedSubject) return res.status(204);
      return res.status(400).send();
    } catch (e) {
      res.status(500).send(e);
    }
  }

  public static async deleteSubject(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      await Subject.findByIdAndDelete(id).exec();
      res.status(204).send();
    } catch (error) {
      res.status(500).send();
    }
  }
  public static async assignPeriods(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const periods: IPeriod[] = req.body.periods;
      if (!periods || !(periods.length > 0))
        return res.status(400).send('Invalid Inputs');
      // Get the subject
      const subject = await Subject.findById(id);
      if (!subject) return res.status(400).send('Subject not found');

      // CHECK IF PERIODS ARE ALREADY ASSIGNED
      // const ps = await Period.find().where('subject', id)

      for (let i = 0; i < periods.length; i++) {
        let curItem = periods[i];
        const curPeriod = await Period.findOne()
          .where('subject', id)
          .where('day', curItem.day)
          .where('time', curItem.time);

        if (!curPeriod) {
          const newPeriod = new Period({
            day: curItem.day,
            time: curItem.time,
            subject: id
          });

          const savedNewPeriod = await newPeriod.save();
          await Subject.findByIdAndUpdate(id, {
            $push: { periods: savedNewPeriod._id }
          });
        }
      }

      const updatedSubject = await Subject.findById(id);
      res.send(updatedSubject);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  public static async getPeriods(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const subjects = await Subject.findById(id)
        .populate({
          path: 'periods',
          select: '-subject'
        })
        .select('periods');

      if (!subjects)
        return res.status(400).send({ message: 'No Periods Assigned Yet!' });
      res.send(subjects.periods);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async getByPage(req: Request, res: Response) {
    try {
      const page: number = +req.query.page || 1;
      const itemsPerPage: number = +req.query.limit || 5;
      const searchTerm: string = req.query.search || '';

      // @TODO check if maybe a search string was sent
      let skipPages = itemsPerPage * (page - 1);
      const titleReg = new RegExp(searchTerm, 'gi');

      const totalSubjects = await Subject.countDocuments();
      const itemsFound = await Subject.find({})
        .where('title', titleReg)
        .count();

      const subjects = await Subject.find({})
        .where('title', titleReg)
        .skip(skipPages)
        .limit(itemsPerPage);

      const result = {
        subjects: subjects,
        count: totalSubjects,
        hasNextPage: itemsPerPage * page < itemsFound,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        currentPage: page
      };
      res.send(result);
    } catch (e) {
      res.status(500).send(e);
    }
  }
}
