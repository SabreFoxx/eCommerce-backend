import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';

import './config/config.js';
import './config/db.js';
import './config/passport.js';

import apiRouter from './routes/api.js';
import indexRouter from './routes/index.js';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize()); // we will use passport
app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
app.use('/api', apiRouter)
app.use('/', indexRouter);

// when our supplied token in routes/api.js is invalid, the authentication middleware throws
// an error to prevent the code from continuing. We need to catch this error and return an a
// message and status
// we added it as the first error handler so that generic handlers don’t intercept it
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401)
            .json({ message: `${err.name} : ${err.message}` });
    }
});

export default app;
