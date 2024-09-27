import express from 'express'
import {authenticateToken} from '../middleware/middleware.js'
import {signup, shop_signup, verifyOTP, signin} from '../controllers/auth.js'
import { createShop, getShopDetails, updateShop } from '../controllers/shop_controller.js'
import {addMenuItem, updateMenuItem, deleteMenuItem, getMenuItem} from '../controllers/menu_controller.js'
const router = express.Router()


router.post('/signup', signup)
router.post('/shop_signup', shop_signup)
router.post('/verifyOTP', verifyOTP)
router.post('/signin', signin)

router.post('/createShop', authenticateToken , createShop)
router.get('/shop/:shopId', authenticateToken, getShopDetails)
router.put('/updateshop/:shopId', authenticateToken, updateShop)

router.post('/shop/:shop_id/addMenuItem', authenticateToken, addMenuItem);
router.put('/shop/:shop_id/updateMenuItem/:item_id', authenticateToken, updateMenuItem);
router.delete('/shop/:shop_id/deleteMenuItem/:item_id', authenticateToken, deleteMenuItem);
router.get('/shop/:shop_id/getAllMenuItems/:item_id', authenticateToken, getMenuItem);

export default router