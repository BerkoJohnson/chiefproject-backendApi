import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { IUser } from 'models/interfaces/user';
import { CONFIG } from '../config/config';
import User from '../models/user';

export class UserController {
  public static async createUser(req: Request, res: Response) {
    try {
      const userData: IUser = req.body.user;
      const user = new User();
      user.name = userData.name;
      user.email = userData.email;
      user.role = userData.role;
      user.password = bcrypt.hashSync(userData.password, 8);

      // user.schema.methods.
      await user.save();
      res.status(204).send();
    } catch (e) {
      res.status(500).send(e);
    }
  }

  public static async getUser(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const user = await User.findById(id).select('-password');
      res.send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  }
  public static async getUsers(req: Request, res: Response) {
    try {
      const user = await User.find().select('-password');
      res.send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  }
  public static async updateUser(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const userData: IUser = req.body.user;
      await User.findByIdAndUpdate(id, { userData });
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }

  // Change user password, req.body should contain the newpassword and the id from req.params
  public static async changeUserPassword(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const newPassword: string = req.body.password;
      const hashedPassword = bcrypt.hashSync(newPassword, 8);
      await User.findByIdAndUpdate(id, { password: hashedPassword });
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async changeUserRole(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const role: string = req.body.role;
      await User.findByIdAndUpdate(id, { role });
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const userData: { email: string; password: string } = req.body.login;
      if (!userData) {
        return res.status(400).send({ message: 'Invalid login credentials' });
      }
      const user = await User.findOne({ email: userData.email });
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      // @TODO sign and return jwt
      if (bcrypt.compareSync(userData.password, user.password)) {
        // @TODO sign and return jwt

        const token = jwt.sign(
          {
            _id: user._id,
            email: user.email,
            role: user.role
          },
          CONFIG.SECRET,
          {
            expiresIn: '24h'
          }
        );
        res.setHeader('auth', token);
        return res.status(201).send();
      } else {
        res.status(400).send({ message: 'Password Mismatch' });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
}
