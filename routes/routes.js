import express from 'express'
import {authenticateToken} from '../middleware/middleware.js'
import {signup, shop_signup, verifyOTP, signin} from '../controllers/auth.js'
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js'
import { createShop, getShopDetails, updateShop, ShopDashboard, getOwnerShops, getAllShops } from '../controllers/shopController.js'
import {addMenuItem, updateMenuItem, deleteMenuItem, getMenuItem, getAllMenuItems} from '../controllers/menuController.js'
import { createOrder, getOrderDetails, listUserOrders, updateOrderStatus, listShopOrders } from '../controllers/orderController.js'
const router = express.Router()


router.post('/signup', signup)
router.post('/shop_signup', shop_signup)
router.post('/verifyOTP', authenticateToken, verifyOTP)
router.post('/signin', signin)

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



router.post('/createOrder', authenticateToken, createOrder)
router.get('/orderDetails/:orderId', authenticateToken, getOrderDetails)
router.get('/listUserOrders', authenticateToken, listUserOrders)
router.put('/updateOrderStatus/:orderId', authenticateToken, updateOrderStatus)
router.get('/listShopOrders', authenticateToken, listShopOrders)

export default router