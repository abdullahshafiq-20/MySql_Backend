export const generateVerificationEmailTemplate = (otp, email) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Campick NUCES</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        
        body {
            font-family: "Poppins", sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #1a1a1a;
        }
        
        .container {
            max-width: 600px;
            justify-content: center;
            align-items: center;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b01 0%, #ff8534 100%);
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 50% 50% 0 0;
        }
        
        .logo-container {
            width: 100%;
            padding: 40px 20px;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
            /* Remove any default margins that might affect centering */
            margin: 0 auto;
            display: block;
        }

        .content {
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        h1 {
            color: #1a1a1a;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 20px;
        }
        
        .welcome-text {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid #e9ecef;
        }
        
        .otp-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #ff6b01;
            background: white;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .security-notice {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
            border-left: 4px solid #ff6b01;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            font-size: 13px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 20px;
                border-radius: 12px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
            }
        }
        .name{
            font-weight: bold;            
            color: #ff6b01;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!--<h2 style="color: white; margin: 0; font-size: 18px;">Campick NUCES</h2>-->
        </div>
        
        <div class="logo-container">
            <img src="https://res.cloudinary.com/dkb1rdtmv/image/upload/v1732474108/logov2_b0l3h0.png" alt="Campick NUCES Logo" class="logo">
        </div>
        
        <div class="content">
            <h1>Verify Your Email Address</h1>
            
            <p class="welcome-text">
                Welcome <span class="name"> ${email} </span>to <strong>Campick NUCES</strong>! We're excited to have you join our campus food ordering community. To get started, please verify your email address.
            </p>
            
            <div class="otp-container">
                <div class="otp-title">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666; font-size: 14px; margin-top: 10px;">
                    Code expires in 5 minutes
                </div>
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email or contact support if you have concerns.
            </div>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Campick NUCES. All rights reserved.</p>
            <p style="margin: 5px 0;">Your Trusted Campus Food Delivery Service</p>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
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
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Password - Campick NUCES</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #1a1a1a;
        }
        
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b01 0%, #ff8534 100%);
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 50% 50% 0 0;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: white;
        }
        
        .logo {
            max-height: 60px;
            width: auto;
        }
        
        .content {
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        h1 {
            color: #1a1a1a;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 20px;
        }
        
        .welcome-text {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        
        .password-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid #e9ecef;
        }
        
        .password-code {
            font-size: 24px;
            font-weight: 700;
            color: #ff6b01;
            background: white;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            font-size: 13px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 20px;
                border-radius: 12px;
            }
            
            .content {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            // <h2 style="color: white; margin: 0; font-size: 18px;">Campick NUCES</h2>
        </div>
        
        <div class="logo-container">
            <img src="https://res.cloudinary.com/dkb1rdtmv/image/upload/v1732474108/logov2_b0l3h0.png" alt="Campick NUCES Logo" class="logo">
        </div>
        
        <div class="content">
            <h1>Welcome to Our Platform!</h1>
            
            <p class="welcome-text">
                Welcome to ${email} <strong>Campick NUCES</strong>! Your account has been created successfully using Google Sign-In.
            </p>
            
            <div class="password-container">
                <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
                    Your Generated Password
                </div>
                <div class="password-code">${password}</div>
                <p style="color: #666; margin-top: 15px;">
                    Please change this password after your first login for security purposes.
                </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; color: #666; border-left: 4px solid #ff6b01;">
                <strong>Note:</strong> This password is only needed if you choose to login without Google in the future.
            </div>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Campick NUCES. All rights reserved.</p>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};
