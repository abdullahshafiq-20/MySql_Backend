# Campick - Campus Food Ordering System

## System Overview
Campick is a comprehensive digital platform designed to streamline food ordering within university campuses, specifically tailored for NUCES (National University of Computer and Emerging Sciences).

## Technical Stack
- **Frontend**: React.js with real-time WebSocket integration
- **Backend**: Node.js/Express
- **Database**: MySQL
- **Real-time Communication**: Socket.io
- **Cloud Services**: Cloudinary for image management
- **Authentication**: JWT, Google OAuth
- **AI Integration**: Google Gemini for payment verification

## Core Features

### 1. Authentication System
- Multi-method authentication (Email/Password, Google OAuth)
- Domain-restricted registration (@nu.edu.pk emails only)
- Role-based access control:
  - Students
  - Teachers (Priority ordering)
  - Shop Owners
  - Administrators

### 2. Order Management
- Real-time order tracking
- Multiple vendor ordering
- Custom delivery notes
- 5-minute cancellation window
- Order history and reordering
- Priority queue for faculty members

### 3. Payment System
- AI-powered payment verification
- Supported payment methods:
  - JazzCash
  - EasyPaisa
  - SadaPay
  - NayaPay
- Screenshot-based verification
- Transaction history
- Automated refund processing

### 4. Vendor Dashboard
- Shop profile management
- Menu customization
- Real-time order notifications
- Revenue tracking
- Analytics dashboard

## Security Features
- JWT-based session management
- Password encryption
- OTP verification
- Rate limiting
- Input validation
- CORS protection

## Integration Points
- Google OAuth API
- Cloudinary API
- SMTP Email Service
- Google Gemini AI
- WebSocket Server

## Performance Metrics
- Response time: < 2 seconds
- Uptime: 99.9%
- Concurrent users: 1000+
- Real-time updates: < 500ms latency

## Deployment
- Backend: Vercel/Render
- Frontend: Netlify
- Database: AWS RDS
- WebSocket: Dedicated server

## Future Roadmap
1. AI-powered order recommendations
2. Blockchain-based payments
3. Voice-activated ordering
4. Cross-campus expansion
5. Mobile application development

## Contact & Support
- Technical Support: support@campick.com
- Business Inquiries: business@campick.com
- Bug Reports: bugs@campick.com

---
© 2024 Campick NUCES. All rights reserved. 