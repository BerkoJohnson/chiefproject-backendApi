
import  {Document} from "mongoose";
import { ISubject } from "./subject";

export interface ITeacher extends Document{
    name: string;
    email:string;
    password?: string;
    contacts: string[];
    subjects: ISubject[],
    createdAt?: Date;
    updatedAt?: Date;
}

