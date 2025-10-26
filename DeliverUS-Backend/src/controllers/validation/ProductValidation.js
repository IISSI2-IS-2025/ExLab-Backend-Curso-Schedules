import { check } from 'express-validator'
import { Product, Restaurant, Schedule } from '../../models/models.js'
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js'

const maxFileSize = 2000000 // around 2Mb

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkScheduleBelongsToRestaurantOnCreate = async (value, { req }) => {
  if (!value) return Promise.resolve() // Permitir scheduleId vacío

  const schedule = await Schedule.findByPk(value)
  if (!schedule) {
    return Promise.reject(new Error('The scheduleId does not exist.'))
  }
  if (schedule.restaurantId !== req.body.restaurantId) {
    return Promise.reject(new Error('The scheduleId does not belong to the given restaurantId.'))
  }
  return Promise.resolve()
}

const checkScheduleBelongsToRestaurantOnUpdate = async (value, { req }) => {
  if (!value) return Promise.resolve() // Permitir scheduleId vacío

  const schedule = await Schedule.findByPk(value)
  if (!schedule) {
    return Promise.reject(new Error('The scheduleId does not exist.'))
  }
  const product = await Product.findByPk(req.params.productId)
  if (product.restaurantId !== schedule.restaurantId) {
    return Promise.reject(new Error('The scheduleId does not belong to the restaurant of this product.'))
  }
  return Promise.resolve()
}

const create = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('description').optional({ checkNull: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('scheduleId').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).toInt().custom(checkScheduleBelongsToRestaurantOnCreate)

]

const update = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }),
  check('description').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').not().exists(),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('restaurantId').not().exists(),
  check('scheduleId').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).toInt().custom(checkScheduleBelongsToRestaurantOnUpdate)
]

export { create, update }
