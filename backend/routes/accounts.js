var express = require('express');
const bcrypt = require('bcrypt');
const { requestAccount, create } = require('../db/requests');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');


/* POST create new account */
router.post('/signup',
    body('username').isEmail(),
    body('password').isLength({ min: 5 }),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newAccount = req.body;
        bcrypt.hash(newAccount.password, 12, function (err, hash) {
            // Store hash in your password DB.
            if (err) {
                return next(err);
            }
            create('accounts', { username: newAccount.username, hash }, (err, account) => {
                if (err) {
                    return next(err);
                }
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 15),
                    id: account.id
                }, 'secret');
                res.status(200).send({ token: token });
            });
        });

    });

/* POST Login */
router.post('/login',
    body('username').isEmail(),
    body('password').isLength({ min: 5 }),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const login = req.body;
        requestAccount(login.username, (err, result) => {
            if (err) {
                return next(err);
            }
            const [account] = result || []; 
            if (!account) {
                return res.status(401).send('Account not found');
            }
            // Compare password
            bcrypt.compare(login.password, account.hash, function (err, result) {
                if (err) return next(err);
                if (!result) return res.status(401).send('Invalid password');
                // Passwords match
                // Create a token
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    id: account.id
                }, 'secret');

                res.send({ token : token });
            });
        });
    });


// function createFile(email) {
//     let token = jwt.sign({
//         exp: Math.floor(Date.now() / 1000) + 60,
//         username: email
// }, 'secret');
// return token;
// }

module.exports = router;
