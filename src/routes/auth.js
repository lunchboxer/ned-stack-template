import { Router } from 'express'
import { login, logout, register } from '../controllers/authcontroller.js'
const authRouter = Router()

authRouter.get('/login', (_req, res) => {
  res.render('login')
})
authRouter.get('/register', (_req, res) => {
  res.render('register')
})

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)

export { authRouter }
