//@types/index.d.ts

import { IUser } from "../models/schemas/users"
import { Request, Response, NextFunction } from 'express';



declare global{
    namespace Express{
        export interface User extends Omit<IUser, "password">  {}

    }
}
