import {Request, Response} from 'express';
import Teacher from '../models/teacher';
import { ITeacher } from '../models/interfaces/teacher';
import Subject from '../models/subject';

interface IRequestPayload extends ITeacher {
  confirmPassword: string;
}


export class TeacherController {
    public static async getTeacher(req: Request, res: Response) {
        try {
          const id: string = req.params.id;
          if (!id) {
            return res.status(400).send({ message: 'Invalid Request Data!' });
          }
          const teacher = await Teacher.findById(id).populate({
            path: 'subjects',
            select: 'title periods',
            populate: {
              path: 'periods',
              select: 'day time'
            }
          });
          if (!teacher) {
            return res.status(400).send({ message: 'No Teacher Found!' });
          }
          res.send(teacher);
        } catch (error) {
          res.status(500).send();
        }
      }
      public static async createTeacher(req: Request, res: Response) {
        try {
          const body: IRequestPayload = req.body.teacher as IRequestPayload;

          if (!(body.name && (body.contacts.length > 0))) {
              return res.status(400).send('Both the name and at least a contact is required');
          }

          if (body.password !== body.confirmPassword) {
              return res.status(400).send('Passwords mismatch');
          }

          const t = await Teacher.findOne({}).sort('-createdAt').limit(1);
          // let teacherId = t ? _helpers.generateIDs('Teacher', t.teacherID) : _helpers.generateIDs('Teacher');
          let teacher = new Teacher();
          teacher.name = body.name;
          teacher.email = body.email;
          teacher.password = body.password;
          // teacher.teacherID = teacherId;
          teacher.contacts = body.contacts;

          // teacher.hashPassword();

          const teacherSaved = await teacher.save();
          res.send(teacherSaved);
        } catch (error) {
          res.status(500).send(error);
        }
      }
      public static async deleteTeacher(req: Request, res: Response) {
        try {
          const id: string = req.params.id;
          await Teacher.findByIdAndDelete(id).exec();
          res.status(204).send();
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
          let skipPages = (page - 1) * itemsPerPage;
          const teachersCount = await Teacher.estimatedDocumentCount();

          const nameReg = new RegExp(searchTerm, 'gi');
          const itemsCount = await Teacher.find({})
            .where('name', nameReg)
            .where('isActive', true)
            .countDocuments();
          const teachers = await Teacher.find({})
            .where('name', nameReg)
            .where('isActive', true)
            .skip(skipPages)
            .limit(itemsPerPage);

          const result = {
            itemsFound: itemsCount,
            teachers: teachers,
            count: teachersCount,
            hasNextPage: itemsPerPage * page < itemsCount,
            hasPrevPage: page > 1,
            nextPage: +page + 1,
            prevPage: +page - 1,
            currentPage: page
          };
          res.send(result);
        } catch (e) {
          res.status(500).send(e);
        }
      }
      public static async updateTeacher(req: Request, res: Response) {
        try {
          const id: string = req.params.id;
          const updateData: any = req.body.updateData;

          if (!id || !updateData) {
            res.status(400).send({ message: 'Invalid Request Data!' });
          }

          let teacher = await Teacher.findById(id).select('-password');
          if (!teacher) {
            return res.status(400).send({ message: 'No Teacher Found!' });
          }
          let countUpdated: number = 0;
          for (let field in updateData) {
            if (updateData[field]) {
              // let originalField = field;
              if (field === 'name') {
                await Teacher.findByIdAndUpdate(id, {
                  name: updateData[field]
                });
                countUpdated += 1;
              }
              if (field === 'contacts') {
                let newContacts: string[] = updateData[field];
                let toUpdateContacts = newContacts.filter(
                  c => teacher && teacher.contacts.includes(c) !== true
                );
                await Teacher.findByIdAndUpdate(id, {
                  $push: { contacts: toUpdateContacts }
                });
                countUpdated += 1;
              }
            }
          }
          const teacherUpdated =
            countUpdated > 0 ? await Teacher.findById(id) : teacher;
          res.send(teacherUpdated);
        } catch (error) {
          res.status(500).send(error);
        }
      }

      public static async resignSubject(req: Request, res: Response) {
        try {
          const id: string = req.params.id;
          const subjectID: any = req.body.subject;

          if (!id || !subjectID) {
            res.status(400).send({ message: 'Invalid Request Data!' });
          }

          let teacher = await Teacher.findById(id).select('-password');
          if (!teacher) {
            return res.status(400).send({ message: 'No Teacher Found!' });
          }

          // @TODO check if subject exists

          const subject = await Subject.findById(subjectID);
          if (!subject)  return res.status(400).send({message: 'Subject not found'})

          // @TODO update both the Teacher & Subject models
          await Teacher.findByIdAndUpdate(id, {$push: {subjects: subjectID}});
          await Subject.findByIdAndUpdate(subjectID, {teacher: id});
          const teacherUpdated = await Teacher.findById(id).select('-password');
          res.send(teacherUpdated);
        } catch (error) {
          res.status(500).send(error);
        }
      }

}
