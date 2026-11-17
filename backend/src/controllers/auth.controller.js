import userModel from '../models/users.models.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const ONE_DAY = 24 * 60 * 60 * 1000

function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ONE_DAY,
        path: '/',
    })
}

function serializeUser(user) {
    return {
        id: user._id.toString(),
        userName: user.userName,
        email: user.email,
    }
}

async function registerUser(req, res) {
    try {
        const body = req.body ?? {}
        const userName = typeof body.userName === 'string' ? body.userName.trim() : ''
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
        const password = typeof body.password === 'string' ? body.password : ''

        if (userName.length < 2 || userName.length > 40 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: 'Enter a name, valid email, and password between 8 and 128 characters.' })
        }

        const userAlreadyExists = await userModel.findOne({
            $or: [{ userName }, { email }],
        })
        if (userAlreadyExists) {
            return res.status(409).json({ message: 'That username or email is already in use.' })
        }

        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({ userName, email, password: hash })
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        )

        setAuthCookie(res, token)
        return res.status(201).json({
            message: 'Account created successfully.',
            user: serializeUser(user),
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'That username or email is already in use.' })
        }
        console.error('Registration failed:', error)
        return res.status(500).json({ message: 'Unable to create your account right now.' })
    }
}

async function loginUser(req, res) {
    try {
        const body = req.body ?? {}
        const identity = typeof body.userName === 'string'
            ? body.userName.trim()
            : typeof body.email === 'string' ? body.email.trim() : ''
        const password = typeof body.password === 'string' ? body.password : ''

        if (!identity || !password) {
            return res.status(400).json({ message: 'Enter your email or username and password.' })
        }

        const user = await userModel.findOne({
            $or: [
                { userName: identity },
                { email: identity.toLowerCase() },
            ],
        })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Email/username or password is incorrect.' })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        )

        setAuthCookie(res, token)
        return res.status(200).json({
            message: 'Signed in successfully.',
            user: serializeUser(user),
        })
    } catch (error) {
        console.error('Login failed:', error)
        return res.status(500).json({ message: 'Unable to sign in right now.' })
    }
}

function getCurrentUser(req, res) {
    return res.status(200).json({ user: serializeUser(req.user) })
}

function logoutUser(_req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })
    return res.status(200).json({ message: 'Signed out successfully.' })
}

export { registerUser, loginUser, getCurrentUser, logoutUser }
