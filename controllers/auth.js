import passport from 'passport';
import { User } from '../models/user.js';

const register = (req, res) => {
    if (!req.body.email || !req.body.firstName || !req.body.lastName || !req.body.password)
        return res.status(400)
            .json({ message: "All fields are required" });
    let user = new User({
        email: req.body.email,
        first_name: req.body.firstName,
        last_name: req.body.lastName
    });
    user.setPassword(req.body.password);
    user.save()
        .then(result => {
            if (result != null) {
                const token = user.generateJwt();
                res.status(201)
                    .json({ token });
            } else {
                res.status(400)
                    .json({ message: "Error creating new user" });
            }
        }).catch(err => {
            res.status(400)
                .json({ message: err.message }); // safe to disclose
        });
}

const login = (req, res) => {
    if (!req.body.email || !req.body.password)
        return res.status(400)
            .json({ message: "Both email and password is required" })

    // this is a function call, to invoke the configured passport strategy
    passport.authenticate('local', (err, user, info) => { // 'local' is strategy
        let token = null;
        if (err) { // passport returns an error
            console.log(err);
            return res.status(500).json({ message: "An unknown error occured while logging in" });
        }
        if (user) { // we've already logged in the user from config/passport.js
            token = user.generateJwt();
            res.status(200)
                .json({ token });
        } else {
            res.status(401)
                // why did the authentication fail? For example, was the login incorrect?
                .json(info);
        }
    })(req, res);// we make req and res available to passport
    // this proves this is a function call
}

export { login, register }