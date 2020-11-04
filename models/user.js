import db, { RECORD_ALREADY_EXISTS } from '../config/db.js';
import jwt from 'jsonwebtoken';
import env from 'dotenv';
import crypto from 'crypto';
env.config();

/**
 * Holds a user account
 */
export class User {
    id;
    firstName;
    lastName;
    email;
    /**
     * encrypted password
     */
    password;
    passwordSalt;

    /**
     * Create an in-memory user account object
     * @param {*} details object containing id, firstName, lastName, email, and password
     */
    constructor({ accountId = null, firstName = null,
        lastName = null, email = null,
        password = null } = {}) {
        this.id = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    /**
     * Save the state of the user account to the database
     * @return {Promise}
     */
    save() {
        return db('account').insert({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            passwordSalt: this.passwordSalt
        }).catch(err => {
            if (err.code == RECORD_ALREADY_EXISTS)
                throw new Error('User already exists');
            console.log(err)
        });
    };

    /**
     * Login a user using email and password
     * @param {string} email email address
     * @return {Promise}
     */
    static loginUsing(email, plainPassword) {
        // let f = db('account').select().where('first_name', email).toSQL()
        // console.log(f)
        // throw new Error
        return db('account').select().where('email', email)
            .then(record => {
                if (record.length < 1)
                    return null;
                return;
                let { accountId, firstName, lastName, email, password,
                    passwordSalt } = record[0];
                let user = new User({ accountId, firstName, lastName, email, password });
                user.setSalt(passwordSalt);
                console.log(user)
                if (user.isPasswordValid(plainPassword)) return user;
                else return null;
            }).catch(err => console.log(err));
    };

    /**
     * generates a signed jwt token for this user account object
     */
    generateJwt() {
        const expiry = new Date;
        expiry.setDate(expiry.getDate() + 7);
        return jwt.sign({
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            exp: parseInt(expiry.getTime() / 1000, 10)
        }, process.env.JWT_SECRET);
    }

    /**
     * ceates and sets a password hash, from a plain password string
     * @param {string} plainPassword plain password striing
     */
    setPassword(plainPassword) {
        this.passwordSalt = crypto.randomBytes(16).toString('hex');
        this.password = crypto
            .pbkdf2Sync(plainPassword, this.passwordSalt, 1000, 64, 'sha512')
            .toString('hex');
    }

    /**
     * is the plain password correct?
     * @param {string} plainPassword plain password string
     */
    isPasswordValid(plainPassword) {
        const passwordHash = crypto
            .pbkdf2Sync(plainPassword, this.passwordSalt, 1000, 64, 'sha512')
            .toString('hex');
        return this.password === passwordHash;
    }

    /**
     * Sets the password salt for this user
     * @param {sting} string 
     */
    setSalt(string) {
        this.passwordSalt = string;
    }
}