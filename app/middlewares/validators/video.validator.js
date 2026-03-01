// Video validator

// Import modules
const {body, validationResult} = require('express-validator');

// Video data validation
exports.validateVideo = [
  body('title')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Video title can not be empty!')
    .bail(),
  body('description') // Cambiamos author por description
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Video description can not be empty!')
    .bail()
    .isLength({min: 3})
    .withMessage('Minimum 3 characters required for description!')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
    next();
  },
];