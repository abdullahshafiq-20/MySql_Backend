import express from 'express'
import passport from 'passport'
import {authenticateToken} from '../middleware/middleware.js'
import {signup, shop_signup, verifyOTP, signin} from '../controllers/auth.js'
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js'
import { createShop, getShopDetails, updateShop, ShopDashboard, getOwnerShops, getAllShops } from '../controllers/shopController.js'
import {addMenuItem, updateMenuItem, deleteMenuItem, getMenuItem, getAllMenuItems} from '../controllers/menuController.js'
import { createOrder, getOrderDetails, listUserOrders, updateOrderStatus, listShopOrders, getPaymentInfo } from '../controllers/orderController.js'
import { getShopPaymentDetails, verifyPaymentAndCreateOrder, getPaymentDetails, updatePaymentStatus  } from '../controllers/paymentController.js'
import { imageUpload } from '../controllers/upload.js'
import { googleCallback, verifyToken } from '../controllers/googleAuthController.js'
import upload from '../utils/multer.js'
const router = express.Router()

router.post('/signup', signup)
router.post('/shop_signup', shop_signup)
router.post('/verifyOTP', authenticateToken, verifyOTP)
router.post('/signin', signin)

// Google Authentication Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signup' }),
  googleCallback
)
router.get('/verifyToken', authenticateToken, verifyToken)
router.post("/imageupload", upload.single("image"), imageUpload)

router.get('/profile', authenticateToken, getProfile)
router.put('/updateProfile', authenticateToken, updateProfile)
router.put('/changePassword', authenticateToken, changePassword)

router.post('/createShop', authenticateToken , createShop)
router.get('/shop/:shopId', authenticateToken, getShopDetails)
router.put('/updateshop/:shopId', authenticateToken, updateShop)
router.get('/shopDashboard/:shopId', authenticateToken, ShopDashboard)
router.get('/ownerShops', authenticateToken, getOwnerShops)

router.post('/shop/:shop_id/addMenuItem', authenticateToken, addMenuItem);
router.put('/shop/:shop_id/updateMenuItem/:item_id', authenticateToken, updateMenuItem);
router.delete('/shop/:shop_id/deleteMenuItem/:item_id', authenticateToken, deleteMenuItem);
router.get('/shop/:shop_id/getAllMenuItems', getAllMenuItems);
router.get('/shop/:shop_id/getMenuItem/:item_id', getMenuItem);
router.get('/getAllShops', getAllShops)

router.get('/shop/:shopId/payment-details', getShopPaymentDetails);
router.get('/paymentDetails/:paymentId', authenticateToken, getPaymentDetails);
router.put('/updatePaymentStatus/:paymentId', authenticateToken, updatePaymentStatus);
router.get('/getPaymentId/:orderId', authenticateToken, getPaymentInfo);

router.post('/createOrder', authenticateToken, createOrder)
router.get('/orderDetails/:orderId', authenticateToken, getOrderDetails)
router.get('/listUserOrders', authenticateToken, listUserOrders)
router.put('/updateOrderStatus/:orderId', authenticateToken, updateOrderStatus)
router.get('/listShopOrders', authenticateToken, listShopOrders)

router.post('/verifyPaymentAndCreateOrder', authenticateToken, verifyPaymentAndCreateOrder)

export default router