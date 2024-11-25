import { body, query, ValidationChain } from 'express-validator';

export const searchTraktMovieValidation: ValidationChain[] = [
  query('title')
    .exists()
    .withMessage('Title cannot be empty')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
];

export const addMovieToCollectionValidation: ValidationChain[] = [
  body('title')
    .exists()
    .withMessage('Title cannot be empty')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('user')
    .exists()
    .withMessage('User cannot be empty')
    .bail()
    .isString()
    .withMessage('User must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('User must be between 1 and 255 characters'),
  body('id')
    .optional()
    .isString()
    .withMessage('Id must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('Id must be between 1 and 255 characters'),
  body('year')
    .exists()
    .withMessage('Year cannot be empty')
    .bail()
    .isInt()
    .withMessage('Year must be an integer'),
  body('length')
    .exists()
    .withMessage('Length cannot be empty')
    .bail()
    .isInt()
    .withMessage('Length must be an integer'),
  body('media')
    .exists()
    .withMessage('Media cannot be empty')
    .bail()
    .isArray()
    .withMessage('Media must be an array'),
  body('size').optional().isNumeric().withMessage('Size must be a number'),
  body('watched').optional().isBoolean().withMessage('Watched must be a boolean'),
  body('backedUp').optional().isBoolean().withMessage('BackedUp must be a boolean'),
  body('backupDate').optional().isString().withMessage('BackupDate must be a string'),
  body('meta_ids').optional().isObject().withMessage('MetaIds must be an object')
];

export const updateMovieValidation: ValidationChain[] = [
  body('id')
    .exists()
    .withMessage('Id cannot be empty')
    .bail()
    .isString()
    .withMessage('Id must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('Id must be between 1 and 255 characters'),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('user')
    .optional()
    .isString()
    .withMessage('User must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('User must be between 1 and 255 characters'),
  body('year').optional().isInt().withMessage('Year must be an integer'),
  body('length').optional().isInt().withMessage('Length must be an integer'),
  body('media').optional().isArray().withMessage('Media must be an array'),
  body('size').optional().isNumeric().withMessage('Size must be a number'),
  body('watched').optional().isBoolean().withMessage('Watched must be a boolean'),
  body('backedUp').optional().isBoolean().withMessage('BackedUp must be a boolean'),
  body('backupDate').optional().isString().withMessage('BackupDate must be a string'),
  body('meta_ids').optional().isObject().withMessage('MetaIds must be an object')
];

export const requireIdQueryValidation: ValidationChain[] = [
  query('id')
    .exists()
    .withMessage('Id cannot be empty')
    .bail()
    .isString()
    .withMessage('Id must be a string')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage('Id must be between 1 and 255 characters')
];
