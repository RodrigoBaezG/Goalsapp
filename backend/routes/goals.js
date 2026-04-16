var express = require('express');
const { requestAllGoals, requestGoalByUser, create, update, remove } = require('../db/requests');
var router = express.Router();
const { body, validationResult } = require('express-validator');

router.get('/', function (req, res, next) {
    requestAllGoals('goals', req.auth.id, (err, goals) => {
        if (err) return next(err);
        res.json(goals);
    });
});

router.get('/:id', function (req, res, next) {
    const goalId = parseInt(req.params.id, 10);
    if (isNaN(goalId)) return res.status(400).json({ error: 'Invalid goal ID' });

    requestGoalByUser(goalId, req.auth.id, (err, goal) => {
        if (err) return next(err);
        if (!goal.length) return res.status(404).json({ error: 'Goal not found' });
        res.json(goal[0]);
    });
});

router.post('/',
    body('details').isLength({ min: 5 }).withMessage('Details must be at least 5 characters'),
    body('period_').notEmpty().withMessage('Period is required'),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { details, icon, events, goal, period_, deadline, completed } = req.body;
        const newGoal = { user_id: req.auth.id, details, icon, events, goal, period_, deadline, completed: completed || 0 };

        create('goals', newGoal, (err, created) => {
            if (err) return next(err);
            res.status(201).json(created);
        });
    });

router.put('/:id',
    body('details').isLength({ min: 5 }).withMessage('Details must be at least 5 characters'),
    body('period_').notEmpty().withMessage('Period is required'),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const goalId = parseInt(req.params.id, 10);
        if (isNaN(goalId)) return res.status(400).json({ error: 'Invalid goal ID' });

        requestGoalByUser(goalId, req.auth.id, (err, existing) => {
            if (err) return next(err);
            if (!existing.length) return res.status(404).json({ error: 'Goal not found' });

            const { details, icon, events, goal, period_, deadline, completed } = req.body;
            const goalData = { details, icon, events, goal, period_, deadline, completed };

            update('goals', goalId, goalData, (err, updated) => {
                if (err) return next(err);
                res.json(updated);
            });
        });
    });

router.delete('/:id', function (req, res, next) {
    const goalId = parseInt(req.params.id, 10);
    if (isNaN(goalId)) return res.status(400).json({ error: 'Invalid goal ID' });

    requestGoalByUser(goalId, req.auth.id, (err, existing) => {
        if (err) return next(err);
        if (!existing.length) return res.status(404).json({ error: 'Goal not found' });

        remove('goals', goalId, (err) => {
            if (err) return next(err);
            res.sendStatus(204);
        });
    });
});

module.exports = router;
