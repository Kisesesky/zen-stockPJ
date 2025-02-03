//view/index.ts

import express from 'express'
import usersRouter from './users.view.router.js'

const router = express.Router()
router.use("/users", usersRouter)

export default router
