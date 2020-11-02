import passport from 'passport';
import passportLocal from 'passport-local';
import { User } from '../models/user.js'

passport.use(new passportLocal.Strategy({ // configure passport for login
    usernameField: 'email'
}, (username, password, done) => {
    User.loginUsing(username, password)
        .then(user => {
            if (!user)
                return done(null, false, { message: 'Incorrect username or password' });
            else
                return done(null, user);
        })
}));