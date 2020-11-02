import express from 'express';
import env from 'dotenv';
import expressJwt from 'express-jwt';

const router = express.Router();
env.config();
const auth = expressJwt({
    secret: process.env.JWT_SECRET,
    // we'll put this property containing our decrypted jwt, inside express' req object
    userProperty: 'payload',
    algorithms: ['HS256']
});

import { login, register } from '../controllers/auth.js';

router.post('/register', register);
router.post('/login', login);

export default router;