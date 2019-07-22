import Student from '../models/student';
import { Request, Response } from 'express';
import Subject from '../models/subject';
import Registration from '../models/registration';
import Period from '../models/period';
import { getLessonStatus } from '../helpers';
import { IStudent } from '../models/interfaces/student';

export class StudentController {
  public static async getStudent(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      if (!id) {
        return res.status(400).send({ message: 'Invalid Request Data!' });
      }
      const student = await Student.findById(id).populate({
        path: 'registrations',
        populate: { path: 'subjects payments, -registrations' }
      });
      if (!student) {
        return res.status(400).send({ message: 'No Student Found!' });
      }
      res.send(student);
    } catch (error) {
      res.status(500).send();
    }
  }
  public static async createStudent(req: Request, res: Response) {
    try {
      const body: IStudent = req.body.student;
      const student = new Student({
        name: body.name,
        contacts: body.contacts,
        guardian: body.guardian,
        date_registered: body.date_registered
      });

      await student.save();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }
  public static async deleteStudent(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      await Student.findByIdAndDelete(id).exec();
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
      const studentCount = await Student.countDocuments();

      const nameReg = new RegExp(searchTerm, 'gi');
      const itemsCount = await Student.find({})
        .where('name', nameReg)
        .where('isActive', true)
        .countDocuments();
      const students = await Student.find({})
        .where('name', nameReg)
        .where('isActive', true)
        .skip(skipPages)
        .limit(itemsPerPage);

      const result = {
        itemsFound: itemsCount,
        students: students,
        count: studentCount,
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
  public static async updateStudent(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const updateData: any = req.body.updateData;

      if (!id || !updateData) {
        res.status(400).send({ message: 'Invalid Request Data!' });
      }

      let student = await Student.findById(id).select('name contacts guardian');
      if (!student) {
        return res.status(400).send({ message: 'No Student Found!' });
      }
      let countUpdated: number = 0;
      for (let field in updateData) {
        if (updateData[field]) {
          // let originalField = field;
          if (field === 'name') {
            await Student.findByIdAndUpdate(id, {
              name: updateData[field]
            });
            countUpdated += 1;
          }
          if (field === 'contacts') {
            let newContacts: string[] = updateData[field];
            let toUpdateContacts = newContacts.filter(
              c => student && student.contacts.includes(c) !== true
            );
            await Student.findByIdAndUpdate(id, {
              $push: { contacts: toUpdateContacts }
            });
            countUpdated += 1;
          }
          if (field === 'guardian' && updateData[field].name) {
            await Student.findByIdAndUpdate(id, {
              'guardian.name': updateData[field].name
            });
            countUpdated += 1;
          }
          if (field === 'guardian' && updateData[field].contacts) {
            let newContacts: string[] = updateData[field].contacts;
            let toUpdateContacts = newContacts.filter(
              c => student && student.guardian.contacts.includes(c) !== true
            );
            await Student.findByIdAndUpdate(id, {
              $push: { 'guardian.contacts': toUpdateContacts }
            });
            countUpdated += 1;
          }
        }
      }
      const studentUpdated =
        countUpdated > 0 ? await Student.findById(id) : student;
      res.send(studentUpdated);
    } catch (error) {
      res.status(500).send(error);
    }
  }
  public static async registerSubjects(req: Request, res: Response) {
    try {
      const studentID: string = req.params.id;
      const { month, subjects } = req.body;
      if (!(studentID && month && subjects.length >= 1)) {
        return res.status(400).send({ message: 'Invalid Data Sent!' });
      }

      let student = await Student.findById(studentID);
      if (!student) {
        return res.status(400).send({ message: 'No Student Found!' });
      }

      // Get if month is the current month;
      const monthsInYear: string[] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      const date = new Date();
      const currentMonthIndex = date.getMonth();
      const requestMonthIndex = monthsInYear.indexOf(month);

      if (requestMonthIndex < currentMonthIndex) {
        return res.status(400).send('Cannot register for a previous month!');
      }

      const registration = await Registration.findOne()
        .where('month', month)
        .where('student', studentID);

      if (!registration) {
        const newRegistration = new Registration();
        newRegistration.student = student;
        newRegistration.month = month;
        newRegistration.subjects = subjects;

        const savedNewRegistration = await newRegistration.save();

        if (!savedNewRegistration) {
          return res.status(500).send({
            error: {
              message: 'Could not save new registration!'
            }
          });
        }
        await Student.findByIdAndUpdate(studentID, {
          $push: { registrations: savedNewRegistration._id }
        });
      } else {
        const subjs = await Subject.find()
          .where('_id')
          .in(subjects);

        const notSaved = subjs.filter(
          sub => registration.subjects.includes(sub._id) !== true
        );
        if (notSaved) {
          await Registration.findByIdAndUpdate(registration._id, {
            $push: { subjects: notSaved }
          });
        }
      }

      const updatedStudent = await Student.findById(studentID);
      res.send(updatedStudent);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  public static async summary(req: Request, res: Response) {
    try {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      const daysInWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];
      const today = new Date().getDay();
      const todayName = daysInWeek[today];

      const m = new Date().getMonth();
      const count = await Student.countDocuments();
      const students = await Student.find()
        .populate({
          path: 'registrations',
          match: { month: months[m] }
        })
        .where('isActive', true)
        .where('registrations')
        .ne([]);

      // const subjects = await Subject.find().populate({ path: 'periods' });
      const lessonsToday = await Period.find()
        .populate({
          path: 'subject',
          select: '-periods'
        })
        .where('day')
        .equals(todayName);

      let lessonArray: any = [];
      for (let i = 0; i < lessonsToday.length; i++) {
        const currentLesson = lessonsToday[i];
        const lessonObj: any = {};
        lessonObj.day = currentLesson.day;
        lessonObj.time = currentLesson.time;
        lessonObj.subject = currentLesson.subject.title;
        lessonObj.status = getLessonStatus(currentLesson.time);

        // Get students who are having this lesson
        const students = await Registration.find()
          .populate('student')
          .select('student subjects -_id')
          .where('subjects')
          .equals(currentLesson.subject._id);
        lessonObj.students = students.map(s => {
          return s.student;
        });
        lessonArray.push(lessonObj);
      }

      res.send({
        count,
        studentsRegistered: students,
        lessons: lessonArray
      });
    } catch (e) {
      res.status(500).send(e);
    }
  }

  public static async getStudentsBySubjectsRegistered(
    req: Request,
    res: Response
  ) {
    try {
      const month: string = req.query.month;
      const s = await Registration.aggregate()
        .match({ month: month })
        .unwind('$subjects')
        .group({ _id: '$subjects', noOfStudents: { $sum: 1 } })
        .sort({ noOfStudents: -1 });

      const subjects: any = [];
      for (let i = 0; i < s.length; i++) {
        const id = s[i]._id.toString();
        const noOfStudents = s[i].noOfStudents;

        const subject = await Subject.findById(id).select('title');
        const studentsArray = await Registration.find()
          .populate('student')
          .where('subjects')
          .in(id);
        const students = studentsArray.map(doc => {
          return {
            _id: doc.student._id,
            name: doc.student.name
          };
        });
        if (subject) {
          subjects.push({
            _id: id,
            title: subject.title,
            noOfStudents: noOfStudents,
            students: students
          });
        }
      }

      return res.send(subjects);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async getStudentsRegisteredThisMonthAndSubjects(
    req: Request,
    res: Response
  ) {
    try {
      const month: string = req.query.month;
      if (!month) {
        return res.status(400).send({ message: 'Invalid Request Data' });
      }
      const studentsArray = await Registration.aggregate()
        .match({ month: month })
        .unwind('$subjects')
        .group({ _id: '$student', subjects: { $sum: 1 } });

      const responseData: any[] = [];
      for (let s of studentsArray) {
        const student = await Student.findById(s._id)
          .select('name')
          .where('isActive', true);
        if (student) {
          responseData.push({
            _id: student._id,
            name: student.name,
            numberOfSubjects: s.subjects
          });
        }
      }
      res.send(responseData);
    } catch (e) {
      res.status(500).send({ e });
    }
  }
}
