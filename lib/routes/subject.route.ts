import { Application } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { checkJWT } from '../middlewares';
import { IRoute } from './route.interface';

const SUBJ_URL = '/api/subjects';

export class SubjectRoutes implements IRoute {
  public routes(app: Application): void {
    app
      .route(`${SUBJ_URL}`)
      .get([checkJWT], SubjectController.getByPage)
      .post([checkJWT], SubjectController.createSubject);

    app
      .route(`${SUBJ_URL}/:id`)
      .get([checkJWT], SubjectController.getSubject)
      .patch([checkJWT], SubjectController.updateSubject)
      .delete([checkJWT], SubjectController.deleteSubject);

    app
      .route(`${SUBJ_URL}/:id/periods`)
      .post([checkJWT], SubjectController.assignPeriods)
      .get([checkJWT], SubjectController.getPeriods);
  }
}
