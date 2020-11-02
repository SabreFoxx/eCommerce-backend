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
    first_name;
    last_name;
    email;
    /**
     * encrypted password
     */
    password;
    password_salt;

    /**
     * Create an in-memory user account object
     * @param {*} details object containing id, first_name, last_name, email, and password
     */
    constructor({ account_id = null, first_name = null,
        last_name = null, email = null,
        password = null } = {}) {
        this.id = account_id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
    }

    /**
     * Save the state of the user account to the database
     * @return {Promise}
     */
    save() {
        return db('account').insert({
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            password: this.password,
            password_salt: this.password_salt
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
        return db('account').select().where('email', email)
            .then(record => {
                if (record.length < 1)
                    return null;
                let { account_id, first_name, last_name, email, password,
                    password_salt } = record[0];
                let user = new User({ account_id, first_name, last_name, email, password });
                user.setSalt(password_salt);
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
            first_name: this.first_name,
            exp: parseInt(expiry.getTime() / 1000, 10)
        }, process.env.JWT_SECRET);
    }

    /**
     * ceates and sets a password hash, from a plain password string
     * @param {string} plainPassword plain password striing
     */
    setPassword(plainPassword) {
        this.password_salt = crypto.randomBytes(16).toString('hex');
        this.password = crypto
            .pbkdf2Sync(plainPassword, this.password_salt, 1000, 64, 'sha512')
            .toString('hex');
    }

    /**
     * is the plain password correct?
     * @param {string} plainPassword plain password string
     */
    isPasswordValid(plainPassword) {
        const passwordHash = crypto
            .pbkdf2Sync(plainPassword, this.password_salt, 1000, 64, 'sha512')
            .toString('hex');
        return this.password === passwordHash;
    }

    /**
     * Sets the password salt for this user
     * @param {sting} string 
     */
    setSalt(string) {
        this.password_salt = string;
    }
}