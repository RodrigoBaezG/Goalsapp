var express = require('express');
const bcrypt = require('bcrypt');
const { requestAccount, create } = require('../db/requests');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/signup',
    body('username').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        bcrypt.hash(password, 12, function (err, hash) {
            if (err) return next(err);
            create('accounts', { username, hash }, (err, account) => {
                if (err) {
                    if (err.code === '23505') {
                        return res.status(409).json({ error: 'Email already in use' });
                    }
                    return next(err);
                }
                const token = jwt.sign({ id: account.id }, JWT_SECRET, { expiresIn: '1h' });
                res.status(201).json({ token });
            });
        });
    });

router.post('/login',
    body('username').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 1 }).withMessage('Password required'),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        requestAccount(username, (err, result) => {
            if (err) return next(err);
            const [account] = result || [];
            if (!account) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            bcrypt.compare(password, account.hash, function (err, match) {
                if (err) return next(err);
                if (!match) return res.status(401).json({ error: 'Invalid credentials' });
                const token = jwt.sign({ id: account.id }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            });
        });
    });

module.exports = router;
