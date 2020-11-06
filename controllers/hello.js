import db from '../config/db.js';

const currentUser = (req, res) => {
    let hi = "hi"
    res.status(200)
        .json({ hi });
}

export {
    currentUser
};