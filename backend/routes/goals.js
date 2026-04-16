var express = require('express');
const { requestAllGoals, request, create, update, remove } = require('../db/requests');
var router = express.Router();
const { body, validationResult } = require('express-validator');

// let goals = [{
//   "id": "1",
//   "icon": "📚",
//   "details": "Learn React",
//   "period": "week",
//   "events": 4,
//   "goal": 10,
//   "deadline": "",
//   "completed": 3,
// },
// {
//   "id": "2",
//   "icon": "📚",
//   "details": "Learn Python",
//   "period": "week",
//   "events": 5,
//   "goal": 20,
//   "deadline": "",
//   "completed": 5,
// },
// {
//   "id": "3",
//   "icon": "📚",
//   "details": "Learn JavaScript",
//   "period": "week",
//   "events": 7,
//   "goal": 15,
//   "deadline": "",
//   "completed": 8,
// }];

/* GET goals listing. */
router.get('/', function (req, res, next) {
  requestAllGoals('goals', req.auth.id, (err, goals) => {
    if (err) {
      return next(err);
    }
    console.log(goals);
    res.send(goals);
  });
});

/*GET goal by ID*/
router.get('/:id', function (req, res, next) {
  const goalId = req.params.id;
  request('goals', goalId, (err, goal) => {
    if (err) {
      return next(err);
    }
    if (!goal.length) {
      return res.status(404).send('Goal not found');
    }
    res.send(goal[0]);
  });
});

/* POST create new goal */
router.post('/',
  body('details').isLength({ min: 5 }),
  body('period_').not().isEmpty(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newGoal = req.body;
    newGoal.user_id = req.auth.id;
    create('goals', newGoal, (err, newGoal) => {
      if (err) {
        return next(err);
      }
      res.status(201).send(newGoal);
    });
  });

/* PUT update goal by ID */
router.put('/:id',
  body('details').isLength({ min: 5 }),
  body('period_').not().isEmpty(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const goalId = req.params.id;
    const goal = req.body;
    if (goal.id != goalId) {
      return res.status(409).send('ID in body does not match ID in URL');
    }

    request('goals', goalId, (err, existingGoal) => {
      if (err) {
        return next(err);
      }
      if (!existingGoal.length) {
        return res.status(404).send('Goal not found');
      }

      update('goals', goalId, goal, (err, updatedGoal) => {
        if (err) {
          return next(err);
        }
        res.send(updatedGoal);
      });
    });
  });

/* DELETE goal by ID */
router.delete('/:id', function (req, res, next) {
  const goalId = req.params.id;
  request('goals', goalId, (err, existingGoal) => {
    if (err) {
      return next(err);
    }
    if (!existingGoal.length) {
      return res.status(404).send('Goal not found');
    }

    remove('goals', goalId, (err) => {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  });
});

module.exports = router;
