import * as bodyParser from 'body-parser';
import express from 'express';
import { connect } from 'mongoose';
import morgan from 'morgan';
import { CONFIG } from './config/config';
import Routes from './routes';

class App {
  public app: express.Application;
  public mongoUrl: string = `mongodb://localhost:27017/${CONFIG.DB_URL}`;

  constructor() {
    this.app = express();
    this.config();
    Routes.initiateRoutes(this.app);
    this.connectMongoDB();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(morgan('dev'));
  }

  private connectMongoDB(): void {
    connect(
      this.mongoUrl,
      { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
    );
  }
}

export default new App().app;
