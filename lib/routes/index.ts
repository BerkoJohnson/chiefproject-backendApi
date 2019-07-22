import { Application } from 'express-serve-static-core';

import { UserRoutes } from './user.route';
import { StudentRoutes } from './student.route';
import { SubjectRoutes } from './subject.route';
import { PeriodRoutes } from './period.route';
import { RegistrationRoutes } from './registration.route';
import { TeacherRoutes } from './teacher.route';

class Routes {
  public static initiateRoutes(app: Application) {
    new UserRoutes().routes(app);
    new StudentRoutes().routes(app);
    new SubjectRoutes().routes(app);
    new PeriodRoutes().routes(app);
    new RegistrationRoutes().routes(app);
    new TeacherRoutes().routes(app);
  }
}
export default Routes;
