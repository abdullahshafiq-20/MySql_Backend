import Tesseract from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';


export const verifyPaymentAndCreateOrder = async (req, res) => {
    const { payment_screenshot_url, shop_id, amount, payment_method, items } = req.body;
    const user_id = req.user.id;
    const order_id = uuidv4();
    const payment_id = uuidv4();

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Validate input
        if (!payment_screenshot_url || !shop_id || !amount || !payment_method || !items || !items.length) {
            throw new Error('Missing required fields');
        }

        // 2. Create order first
        await connection.execute(
            `INSERT INTO orders (
                order_id, user_id, shop_id, 
                total_price, status, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [order_id, user_id, shop_id, amount, 'pending', 'pending']
        );

        // 3. Create payment record
        await connection.execute(
            `INSERT INTO payments (
                payment_id, order_id, user_id, shop_id, 
                amount, payment_method, payment_screenshot_url, 
                verification_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [payment_id, order_id, user_id, shop_id, amount, payment_method, 
             payment_screenshot_url, 'pending']
        );

        // 4. Perform OCR on the payment screenshot
        let ocrResult;
        try {
            ocrResult = await performOCR(payment_screenshot_url);
            // console.log(ocrResult.text, "ocrResult")
            
            // Update payment record with OCR text
            await connection.execute(
                'UPDATE payments SET ocr_text = ? WHERE payment_id = ?',
                [ocrResult.text, payment_id]
            );
        } catch (ocrError) {
            console.error('OCR Error:', ocrError);
            throw new Error('Failed to process payment screenshot');
        }

        // 5. Verify payment amount from OCR
        const extractedAmount = extractAmountFromOCR(ocrResult.text);
        console.log(extractedAmount, "extractedAmount")
        if (!verifyPaymentAmount(extractedAmount, amount)) {
            throw new Error('Payment amount verification failed');
        }

        // 6. Create order items
        for (const item of items) {
            // Verify item price and availability
            const [menuItemResult] = await connection.execute(
                'SELECT price FROM menu_items WHERE item_id = ? AND shop_id = ?',
                [item.item_id, shop_id]
            );

            if (menuItemResult.length === 0) {
                throw new Error(`Menu item ${item.item_id} not found or does not belong to the shop`);
            }

            const itemPrice = menuItemResult[0].price * item.quantity;

            await connection.execute(
                `INSERT INTO order_items (
                    order_id, item_id, quantity, price
                ) VALUES (?, ?, ?, ?)`,
                [order_id, item.item_id, item.quantity, itemPrice]
            );
        }

        // 7. Update payment verification status
        await connection.execute(
            'UPDATE payments SET verification_status = ? WHERE payment_id = ?',
            ['verified', payment_id]
        );

        // 8. Update order status and payment status
        await connection.execute(
            'UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?',
            ['accepted', 'completed', order_id]
        );

        // 9. Update shop's total revenue
        await connection.execute(
            'UPDATE shops SET total_revenue = total_revenue + ? WHERE id = ?',
            [amount, shop_id]
        );

        await connection.commit();

        // 10. Fetch complete order details for response
        const [orderDetails] = await connection.execute(
            `SELECT o.*, u.user_name, u.email, s.name as shop_name,
                    p.payment_method, p.payment_screenshot_url
             FROM orders o
             JOIN users u ON o.user_id = u.id
             JOIN shops s ON o.shop_id = s.id
             JOIN payments p ON o.order_id = p.order_id
             WHERE o.order_id = ?`,
            [order_id]
        );

        const [orderItems] = await connection.execute(
            `SELECT oi.*, mi.name as item_name
             FROM order_items oi
             JOIN menu_items mi ON oi.item_id = mi.item_id
             WHERE oi.order_id = ?`,
            [order_id]
        );

        // 11. Emit socket event for real-time updates
        // const io = req.app.get('io');
        // io.emit('newOrder', {
        //     ...orderDetails[0],
        //     items: orderItems
        // });

        res.status(201).json({
            status: 'success',
            message: 'Payment verified and order created successfully',
            order: {
                ...orderDetails[0],
                items: orderItems
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Payment verification error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to verify payment and create order'
        });
    } finally {
        connection.release();
    }
};

// Helper function to perform OCR using Tesseract.js
const performOCR = async (imageUrl) => {
    try {
        const result = await Tesseract.recognize(
            imageUrl,
            'eng',
            {
                logger: m => console.log(m)
            }
        );
        return {
            text: result.data.text,
            confidence: result.data.confidence,
            data: result.data
        };
        
    } catch (error) {
        throw new Error('OCR processing failed');
    }

};

const extractAmountFromOCR = (ocrText) => {
    // Common patterns for payment screenshots, including the new format
    const patterns = [
        /amount:?\s*(?:pk?r?|rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
        /paid:?\s*(?:pk?r?|rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
        /total:?\s*(?:pk?r?|rs\.?)\s*([\d,]+(?:\.\d{2})?)/i,
        /(?:pk?r?|rs\.?)\s*([\d,]+(?:\.\d{2})?)/i
    ];

    for (const pattern of patterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
            // Remove commas and convert to float
            return parseFloat(match[1].replace(/,/g, ''));
        }
    }

    throw new Error('Could not extract payment amount from screenshot');
};

// Helper function to verify payment amount
const verifyPaymentAmount = (extractedAmount, expectedAmount) => {
    // Allow for a small difference (e.g., 1%) to account for OCR inaccuracies
    const tolerance = expectedAmount * 0.01;
    return Math.abs(extractedAmount - expectedAmount) <= tolerance;
};

// API endpoint to fetch shop payment details
export const getShopPaymentDetails = async (req, res) => {
    const { shopId } = req.params;

    try {
        const [paymentDetails] = await pool.execute(
            `SELECT sc.*, u.email as owner_email
             FROM shop_contacts sc
             JOIN shops s ON sc.shop_id = s.id
             JOIN users u ON s.owner_id = u.id
             WHERE sc.shop_id = ?`,
            [shopId]
        );

        if (!paymentDetails.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Shop payment details not found'
            });
        }

        // Format payment details for frontend
        const formattedDetails = paymentDetails.map(detail => ({
            id: detail.id,
            type: detail.payment_method,
            details: [
                detail.full_name,
                detail.payment_details,
                detail.contact_number
            ].filter(Boolean)
        }));

        res.json({
            status: 'success',
            methods: formattedDetails
        });

    } catch (error) {
        console.error('Error fetching shop payment details:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch shop payment details'
        });
    }
};