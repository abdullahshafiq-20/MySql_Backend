import express from 'express'
import {signup, verifyOTP, signin} from '../controllers/auth.js'
const router = express.Router()


router.post('/signup', signup)
router.post('/verifyOTP', verifyOTP)
router.post('/signin', signin)

export default router