import { IRoute } from './route.interface';
import { Application } from 'express';
import { checkJWT } from '../middlewares';
import { RegistrationController } from '../controllers/registration.controller';

export class RegistrationRoutes implements IRoute {
  public routes(app: Application) {
    // REGISTRATIONS
    app
      .route('/api/registrations/:id')
      .get([checkJWT], RegistrationController.getRegistration)
      .delete([checkJWT], RegistrationController.deleteRegistration);

    app
      .route('/api/registrations/:id/unregister')
      .post([checkJWT], RegistrationController.unregisterSubjeect);
  }
}
