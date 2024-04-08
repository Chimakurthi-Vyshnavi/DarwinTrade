const { Router } = require('express')
const vendorControllers = require('../controllers/vendorControllers')
const { requireAuth, checkEmployee } = require('../miiddleware/authMiddleware')
const { mulUpload } = require('../miiddleware/multerConfig')
const router = Router()

router.get('/productAnalytics', requireAuth, checkEmployee, vendorControllers.getProducts)
router.get('/order/:id', requireAuth, checkEmployee, vendorControllers.getOrderDetails)
router.get('/productAnalytics/product/:id', requireAuth, checkEmployee, vendorControllers.getAnalytics)
router.post('/addProduct', requireAuth, mulUpload, checkEmployee, vendorControllers.postAddProduct)
router.get('/editProduct', requireAuth, checkEmployee, vendorControllers.getEditProduct)
router.get('/editProduct/products/:id', requireAuth, checkEmployee, vendorControllers.getProductDetails)
router.post('/editProduct/products/:id', requireAuth, mulUpload, checkEmployee, vendorControllers.postEditProduct)
router.get('/statistics', requireAuth, checkEmployee, vendorControllers.getStats)
router.get('/account', requireAuth, checkEmployee, vendorControllers.getAccount)
router.post('/account', requireAuth, mulUpload, checkEmployee, vendorControllers.postProfile)
router.get('/changePassword', requireAuth, checkEmployee, vendorControllers.getChangePassword)
router.post('/changePassword', requireAuth, checkEmployee, vendorControllers.postChangePassword)

module.exports = router
