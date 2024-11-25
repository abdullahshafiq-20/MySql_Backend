export const generateVerificationEmailTemplate = (otp, email) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Campick NUCES</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Poppins", serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #333333;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        
        .logo-container {
            text-align: center;
            padding: 20px 0;
            /*background-color: #f6f9fc;*/
        }
        
        .logo {
            max-width: 180px;
            height: auto;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b01 0%, #ff8534 100%);
            padding: 40px 0;
            text-align: center;
            border-bottom-left-radius: 50% 20px;
            border-bottom-right-radius: 50% 20px;
        }

        .content {
            padding: 40px;
            text-align: center;
        }
        
        h1 {
            color: #333333;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px;
        }
        
        .welcome-text {
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        
        .otp-container {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #e9ecef;
        }
        
        .otp-title {
            font-size: 14px;
            color: #666666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #ff6b01;
            background: white;
            padding: 12px 20px;
            border-radius: 6px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .security-notice {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666666;
            border-left: 4px solid #ff6b01;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
        }
        
        .name {
            font-weight: 600;            
            color: #ff6b01;
        }

        @media (max-width: 600px) {
            .email-wrapper {
                margin: 20px;
                border-radius: 16px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
      <div class="header"></div>
        <div class="logo-container">
            <img src="https://res.cloudinary.com/dkb1rdtmv/image/upload/v1732474108/logov2_b0l3h0.png" alt="Campick NUCES Logo" class="logo">
        </div>
        
        
        
        <div class="content">
            <h1>Verify Your Email Address</h1>
            
            <p class="welcome-text">
                Welcome <span class="name">${email}</span> to <strong>Campick NUCES</strong>! We're excited to have you join our campus food ordering community. To get started, please verify your email address.
            </p>
            
            <div class="otp-container">
                <div class="otp-title">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666666; font-size: 14px; margin-top: 10px;">
                    Code expires in 5 minutes
                </div>
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email or contact support if you have concerns.
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Campick NUCES. All rights reserved.</p>
            <p style="margin: 5px 0;">Your Trusted Campus Food Delivery Service</p>
            <p style="color: #999999; margin-top: 10px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>


    `;
};

export const generatePasswordEmailTemplate = (password, email) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Campick NUCES</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Poppins", serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #333333;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        
        .logo-container {
            text-align: center;
            padding: 20px 0;
            /*background-color: #f6f9fc;*/
        }
        
        .logo {
            max-width: 180px;
            height: auto;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b01 0%, #ff8534 100%);
            padding: 40px 0;
            text-align: center;
            border-bottom-left-radius: 50% 20px;
            border-bottom-right-radius: 50% 20px;
        }

        .content {
            padding: 40px;
            text-align: center;
        }
        
        h1 {
            color: #333333;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px;
        }
        
        .welcome-text {
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        
        .password-container {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #e9ecef;
        }
        
        .password-title {
            font-size: 14px;
            color: #666666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .password-code {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #ff6b01;
            background: white;
            padding: 12px 20px;
            border-radius: 6px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .security-notice {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666666;
            border-left: 4px solid #ff6b01;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
        }
        
        .name {
            font-weight: 600;            
            color: #ff6b01;
        }

        @media (max-width: 600px) {
            .email-wrapper {
                margin: 20px;
                border-radius: 16px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .password-code {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
      <div class="header"></div>
        <div class="logo-container">
            <img src="https://res.cloudinary.com/dkb1rdtmv/image/upload/v1732474108/logov2_b0l3h0.png" alt="Campick NUCES Logo" class="logo">
        </div>
        
        
        
        <div class="content">
            <h1>Welcome to Campick NUCES</h1>
            
            <p class="welcome-text">
                Welcome, <span class="name">${email}</span>, to <strong>Campick NUCES</strong>! We're thrilled to have you join our campus food ordering community. Below is your account password, which you can use when opting not to sign in via Google authentication.
            </p>
            
            <div class="password-container">
                <div class="password-title">Your Password</div>
                <div class="password-code">${password}</div>
                <div style="color: #666666; font-size: 14px; margin-top: 10px;">
                    Please change this password after your first login.
                </div>
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong> Keep this password confidential. We recommend changing it to a strong, unique password of your choice upon your first login.
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Campick NUCES. All rights reserved.</p>
            <p style="margin: 5px 0;">Your Trusted Campus Food Delivery Service</p>
            <p style="color: #999999; margin-top: 10px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>


    `;
};

export const generateOrderConfirmationEmail = (orderDetails) => {
    const { 
        order_id, 
        total_price, 
        items, 
        shop_name, 
        payment_method,
        payment_status,
        order_status 
    } = orderDetails;
    
    const itemsList = items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.item_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Rs. ${item.price}</td>
        </tr>
    `).join('');

    // Function to get status badge color
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'verified':
                return '#28a745';
            case 'pending':
                return '#ffc107';
            case 'rejected':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    // Add these styles to the existing style section
    const additionalStyles = `
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .status-container {
            margin: 10px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .status-label {
            font-weight: 600;
            color: #666;
            margin-right: 10px;
        }
    `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Campick NUCES</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Poppins", serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #333333;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        
        .logo-container {
            text-align: center;
            padding: 20px 0;
            /*background-color: #f6f9fc;*/
        }
        
        .logo {
            max-width: 180px;
            height: auto;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b01 0%, #ff8534 100%);
            padding: 40px 0;
            text-align: center;
            border-bottom-left-radius: 50% 20px;
            border-bottom-right-radius: 50% 20px;
        }

        .content {
            padding: 40px;
        }
        
        h1 {
            color: #333333;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px;
            text-align: center;
        }
        
        .welcome-text {
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .order-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .order-table th {
            background: #ff6b01;
            color: white;
            padding: 10px;
            text-align: left;
        }
        
        .order-table td {
            padding: 10px;
            border-bottom: 
1px solid #e9ecef;
        }
        
        .total-price {
            font-size: 20px;
            color: #ff6b01;
            font-weight: bold;
            margin: 15px 0;
            text-align: right;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .status-container {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .status-label {
            font-weight: 600;
            color: #666666;
            margin-right: 10px;
        }
        
        .security-notice {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666666;
            border-left: 4px solid #ff6b01;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 600px) {
            .email-wrapper {
                margin: 20px;
                border-radius: 16px;
            }
            
            .content {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">

        
        <div class="header"></div>
        <div class="logo-container">
            <img src="https://res.cloudinary.com/dkb1rdtmv/image/upload/v1732474108/logov2_b0l3h0.png" alt="Campick NUCES Logo" class="logo">
        </div>
        
        <div class="content">
            <h1>Order Confirmation</h1>
            
            <p class="welcome-text">
                Thank you for your order at <strong>${shop_name}</strong>!
            </p>
            
            <div class="status-container">
                <div>
                    <span class="status-label">Payment Status:</span>
                    <span class="status-badge" style="background-color: ${getStatusColor(payment_status)}">
                        ${payment_status}
                    </span>
                </div>
                <div style="margin-top: 10px;">
                    <span class="status-label">Order Status:</span>
                    <span class="status-badge" style="background-color: ${getStatusColor(order_status)}">
                        ${order_status}
                    </span>
                </div>
            </div>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${order_id}</p>
                <p><strong>Payment Method:</strong> ${payment_method}</p>
                
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                </table>
                
                <div class="total-price">
                    Total: Rs. ${total_price}
                </div>
            </div>
            
            <div class="security-notice">
                <strong>Note:</strong> Your order has been received and is being processed. 
                ${payment_status === 'pending' ? 
                    'Your payment is currently under review. We will process your order once the payment is verified.' : 
                    'You will receive updates about your order status.'}
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Campick NUCES. All rights reserved.</p>
            <p style="margin: 5px 0;">Your Trusted Campus Food Delivery Service</p>
        </div>
    </div>
</body>
</html>


    `;
};
