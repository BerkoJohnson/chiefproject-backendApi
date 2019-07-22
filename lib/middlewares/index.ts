import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { CONFIG } from '../config/config';
import { IUser } from '../models/interfaces/user';
import User from '../models/user';

interface ITokenPayload {
  email: string;
  _id: string;
  role: string;
  iat: number;
  exp: number;
}

interface IReq extends Request {
  user: IUser;
}

export async function checkJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.headers.auth) { return res.status(401).send('NO TOKEN SENT!'); }
    const token = req.headers.auth as string;
    let userVerified: ITokenPayload;
    jwt.verify(token, CONFIG.SECRET, async (error, decoded) => {
      if (error) {
        return res.status(401).send(`${error.message.toUpperCase()}`);
      }
      userVerified = decoded as ITokenPayload;

      const user = await User.findById(userVerified._id);
      if (!user) {
        return res.status(401).send({ message: 'Cannot access this page' });
      }
      next();
    });
  } catch (error) {
    next(error);
    res.status(401).send();
  }
}
