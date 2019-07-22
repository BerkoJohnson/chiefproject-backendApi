import { Application } from 'express';
import { UserController } from '../controllers/user.controller';
import { checkJWT } from '../middlewares';
import { PeriodController } from '../controllers/period.controller';
import { IRoute } from './route.interface';

const USER_URL = '/api/users';

export class UserRoutes implements IRoute {
  public routes(app: Application): void {

    // User Controller
    app
      .route(`${USER_URL}`)
      .post([checkJWT], UserController.createUser)
      .get([checkJWT], UserController.getUsers);

    app.route(`${USER_URL}/login`).post(UserController.login);

    app
      .route(`${USER_URL}/:id`)
      .get([checkJWT], UserController.getUser)
      .patch([checkJWT], UserController.updateUser);

    app
      .route(`${USER_URL}/:id/change-password`)
      .patch([checkJWT], UserController.changeUserPassword);

    app
      .route(`${USER_URL}/:id/change-role`)
      .patch([checkJWT], UserController.changeUserRole);
  }
}
