import { User } from '../models/userModel.js'
import { generateJwt, hashPassword, passwordMatches } from '../utils/crypto.js'
import { getUserOrThrow, renderFormWithErrors } from './userController.js'

const setAuthCookie = (res, token) => {
  res.cookie('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}

export const apiRegister = async (req, res) => {
  try {
    if (!req.body) {
      throw new Error('Missing request body')
    }
    const { username, password, email, name } = req.body

    if (!(username && password && email)) {
      throw new Error('Missing username, email or password')
    }

    const userExists = await User.isUsernameTaken(username)
    if (userExists) {
      return res.status(400).json({
        errors: {
          username: 'User already exists',
        },
      })
    }

    const hashedPassword = await hashPassword(password)

    const userData = {
      username,
      name,
      email,
      password: hashedPassword,
      role: 'user',
    }
    const { data: user, errors } = await User.create(userData)

    if (errors) {
      return res.status(400).json({ errors: errors })
    }

    const token = await generateJwt({ id: user.id }, process.env.JWT_SECRET)

    setAuthCookie(res, token)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const login = async (req, res, _next) => {
  const redirectUrl = req.query.redirect || '/'

  try {
    if (!req.body) {
      throw new Error('Missing request body')
    }

    const { username, password } = req.body
    if (!(username && password)) {
      throw new Error('Username and password are required')
    }

    const { data: user, errors } = await User.findByUsername(username, true)
    if (errors) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await passwordMatches(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const token = await generateJwt({ id: user.id }, process.env.JWT_SECRET)

    setAuthCookie(res, token)
    req.session.alert = {
      type: 'success',
      message: `You're now logged in as ${user.username}!`,
    }
    return res.redirect(redirectUrl)
  } catch (error) {
    res.render('auth/login', {
      ...req.body,
      errors: { all: error.message },
    })
  }
}

export const showChangePasswordForm = (req, res, _next) =>
  renderFormWithErrors(req, res, 'user/change-password')

export const changePassword = async (req, res, _next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body

  if (newPassword !== confirmPassword) {
    return renderFormWithErrors(req, res, 'user/change-password', {
      confirmPassword: 'Passwords do not match',
    })
  }

  const user = await getUserOrThrow(req, res, null)
  if (req.user.role !== 'admin') {
    if (!passwordMatches(currentPassword, user.password)) {
      return renderFormWithErrors(req, res, 'user/change-password', {
        currentPassword: 'Invalid password',
      })
    }
  }

  const hashedPassword = await hashPassword(newPassword)

  User.patch(req.params.id, { password: hashedPassword })

  if (req.user.id === req.params.id) {
    req.session.alert = {
      type: 'success',
      message:
        'You have been logged out. Please log in with your new password.',
    }
    return res.redirect('/auth/logout')
  }
  req.session.alert = {
    type: 'success',
    message: `You've successfully changed "${user.username}"'s password.`,
  }
  return res.redirect(`/user/${req.params.id}`)
}

export const register = async (req, res, _next) => {
  try {
    const { data: user, errors } = await User.create(req.body)

    if (errors) {
      return res.render('auth/register', {
        ...req.body,
        errors,
      })
    }

    const token = await generateJwt({ id: user.id }, process.env.JWT_SECRET)

    setAuthCookie(res, token)
    req.session.alert = {
      type: 'success',
      message: "You've registered and logged in successfully.",
    }
    const redirectUrl = req.query.redirect || '/'
    return res.redirect(redirectUrl)
  } catch (error) {
    return res.render('auth/register', {
      ...req.body,
      errors: { all: error.message },
    })
  }
}

export const logout = (req, res) => {
  res.clearCookie('auth')
  if (req.accepts('html')) {
    req.session.alert = {
      type: 'success',
      message: `You're now logged out.`,
    }
    return res.redirect('/')
  }
  if (req.accepts('json')) {
    return res.status(204)
  }
}
