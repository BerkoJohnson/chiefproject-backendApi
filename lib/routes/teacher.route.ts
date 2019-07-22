import { IRoute } from './route.interface';
import { Application } from 'express';
import { checkJWT } from '../middlewares';
import { TeacherController } from '../controllers/teacher.controller';

const TEACHER_URL = '/api/teachers';

export class TeacherRoutes implements IRoute {
  public routes(app: Application) {
    app
      .route(`${TEACHER_URL}`)
      .get([checkJWT], TeacherController.getByPage)
      .post([checkJWT], TeacherController.createTeacher);

      app
      .route(`${TEACHER_URL}/reassign`)
      .get([checkJWT], TeacherController.resignSubject);

    app
      .route(`${TEACHER_URL}/:id`)
      .patch([checkJWT], TeacherController.updateTeacher)
      .get([checkJWT], TeacherController.getTeacher)
      .delete([checkJWT], TeacherController.deleteTeacher);

    // app
    //   .route(`${TEACHER_URL}/:id/register`)
    //   .put([checkJWT], TeacherController.registerSubjects);
  }
}
