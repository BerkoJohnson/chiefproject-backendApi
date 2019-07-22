import { Application } from "express";

export interface IRoute {
    routes(app: Application): void;
}