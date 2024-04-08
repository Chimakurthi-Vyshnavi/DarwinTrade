const { Router } = require('express')
const cartControllers = require('../controllers/cartControllers')
const { requireAuth, checkEmployee } = require('../miiddleware/authMiddleware')
const router = Router()

router.get('/cart', requireAuth, checkEmployee, cartControllers.getCart)
router.post('/cart', requireAuth, checkEmployee, cartControllers.postCart)
router.post('/checkQuantity', requireAuth, checkEmployee, cartControllers.postCheckQuantity)
router.post('/removeCartProduct', requireAuth, checkEmployee, cartControllers.postRemoveCartProduct)

module.exports = router