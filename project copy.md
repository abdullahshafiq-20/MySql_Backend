# Software Requirements Specification - Campus Food Ordering System

## 1. Introduction

### 1.1 Purpose
This document outlines the comprehensive software requirements for the Campus Food Ordering System (CFOS), version 1.0. CFOS is a sophisticated web-based platform tailored for university campuses, designed to streamline the food ordering process between students, faculty, and campus food vendors. The system encompasses various functionalities, including order management, payment processing, vendor operations, and real-time notifications, ensuring a seamless user experience.

### 1.2 Document Conventions
- **Priority Levels**
  - **Critical**: Features that are essential for basic system functionality and must be implemented.
  - **High**: Important features that are necessary for the system's initial launch.
  - **Medium**: Features that enhance the system but can be implemented after the launch.
  - **Low**: Features that are desirable for future enhancements and improvements.

- **Technical Conventions**
  - Code adheres to ES6+ JavaScript standards for consistency and modern practices.
  - RESTful API endpoints are structured using kebab-case for clarity.
  - Database columns are named using snake_case for readability.
  - Component names follow PascalCase to align with industry standards.
  - Function names utilize camelCase for consistency in coding style.

### 1.3 Intended Audience and Reading Suggestions
1. **Development Team**
   - Focus on sections: 2.2, 3.3, 4.0
   - Review technical specifications and API documentation thoroughly.
   - Understand authentication and security requirements to ensure compliance.

2. **Project Managers**
   - Focus on sections: 1.4, 2.2, 5.0
   - Review timelines and dependencies to manage project deliverables effectively.
   - Understand resource requirements for optimal project execution.

3. **University Administrators**
   - Focus on sections: 1.4, 2.3, 5.2
   - Review security and compliance requirements to ensure adherence to university policies.
   - Understand user management and access control for effective oversight.

4. **Food Vendors**
   - Focus on sections: 2.2, 4.2, 5.4
   - Review the order management process to facilitate smooth operations.
   - Understand payment handling to ensure timely transactions.

### 1.4 Product Scope
The CFOS aims to revolutionize campus food ordering through:

1. **Core Functionalities**
   - Comprehensive digital menu management for vendors.
   - Real-time order tracking to enhance user experience.
   - Secure payment processing to protect user data.
   - Automated order notifications to keep users informed.
   - Vendor analytics dashboard for performance insights.

2. **Business Objectives**
   - Reduce order processing time by 75% to improve efficiency.
   - Enhance vendor revenue tracking for better financial management.
   - Improve the overall student dining experience through streamlined processes.
   - Enable data-driven business decisions for vendors.

3. **Target Benefits**
   - Streamlined ordering process to minimize user effort.
   - Reduced wait times for food delivery.
   - Improved order accuracy to enhance customer satisfaction.
   - Enhanced financial tracking for better resource allocation.
   - Better resource management for vendors.

### 1.5 References
1. **Technical Documentation**
   - Node.js v16+ Documentation for backend development.
   - Express.js 4.x Documentation for server-side framework guidance.
   - MySQL 8.0 Reference Manual for database management.
   - Socket.IO v4 Documentation for real-time communication.

2. **API Documentation**
   - Google OAuth 2.0 Documentation for authentication processes.
   - Cloudinary API Documentation for image management.
   - Gemini API Documentation for payment validation.

3. **Standards**
   - JWT RFC 7519 for secure token handling.
   - REST API Design Standards for consistent API development.
   - OWASP Security Guidelines for best practices in security.

## 2. Overall Description

### 2.1 Product Perspective
CFOS is a comprehensive system with the following architecture:

1. **Frontend Layer**
   - A user-friendly interface built on React.js for an engaging user experience.
   - Responsive design to accommodate various devices and screen sizes.
   - Real-time updates facilitated by WebSocket technology.

2. **Backend Services**
   - A robust Node.js/Express.js server for handling requests and responses.
   - RESTful API endpoints for efficient data communication.
   - A WebSocket server for real-time communication and updates.

3. **External Integrations**
   - **Payment Processing**
     - Screenshot-based verification for secure transactions.
     - Gemini AI for intelligent payment validation.
   
   - **Image Management**
     - Cloudinary for efficient image storage and management.
     - Image optimization for faster loading times.
   
   - **Authentication**
     - Google OAuth for secure user authentication.
     - JWT-based sessions for maintaining user state.
   
   - **Notifications**
     - Email notifications via SMTP for user updates.
     - Real-time socket updates for immediate communication.

### 2.2 Product Functions
1. **User Authentication**
   - Email/password registration for user accounts.
   - Google OAuth integration for seamless login.
   - OTP verification for enhanced security.
   - Role-based access control to manage user permissions.
   - Session management for user state maintenance.

2. **Shop Management**
   - Shop profile creation for vendors.
   - Menu management for easy updates and changes.
   - Operating hours management for vendor availability.
   - Order processing for efficient handling of customer requests.
   - Analytics dashboard for performance tracking.

3. **Order System**
   - Cart management for user convenience.
   - Order placement for initiating transactions.
   - Real-time tracking for order status updates.
   - Order history for user reference.
   - Status updates to keep users informed.

4. **Payment System**
   - Payment screenshot upload for verification.
   - AI-powered verification for secure transactions.
   - Payment status tracking for user transparency.
   - Transaction history for user records.
   - Refund processing for customer satisfaction.

5. **Analytics & Reporting**
   - Sales reports for vendor insights.
   - Popular items tracking for inventory management.
   - Revenue analytics for financial oversight.
   - Customer insights for targeted marketing.
   - Performance metrics for operational improvements.

### 2.3 User Classes and Characteristics

1. **Students**
   - Primary system users with the following features:
     - Order placement for food items.
     - Payment management for transactions.
     - Order tracking for real-time updates.
     - History viewing for past orders.
   - Characteristics:
     - Tech-savvy and familiar with online platforms.
     - Frequent users of the system.
     - Budget-conscious and value-driven.
     - Time-sensitive and require quick service.

2. **Teachers**
   - Secondary system users with similar features to students:
     - Higher priority orders for time-sensitive needs.
   - Characteristics:
     - Less frequent users compared to students.
     - Higher average order value due to larger meal requirements.
     - Time-constrained and require efficient service.

3. **Shop Owners**
   - Business users with the following features:
     - Menu management for shop offerings.
     - Order processing for customer requests.
     - Analytics access for performance insights.
     - Payment management for financial transactions.
   - Characteristics:
     - Daily system usage for operational efficiency.
     - Business-focused with a need for reliable service.
     - Require technical support for system issues.

4. **System Administrators**
   - Technical users responsible for system oversight:
     - User management for account control.
     - System monitoring for performance tracking.
     - Support tools for troubleshooting.
     - Configuration management for system settings.
   - Characteristics:
     - Technical expertise in system administration.
     - System-wide access for comprehensive oversight.
     - Support role for user assistance.

### 2.4 Operating Environment
- Node.js runtime environment for backend services.
- MySQL database for data storage and management.
- Cloud hosting platform for scalability and reliability.
- Modern web browsers for user access.
- Mobile-responsive design for accessibility.
- Secure HTTPS protocol for data protection.

### 2.5 Design and Implementation Constraints

1. **Technical Constraints**
   - Node.js version 16+ is required for compatibility.
   - MySQL 8.0+ database for data management.
   - HTTPS protocol is mandatory for secure communications.
   - Maximum file upload size is limited to 5MB.
   - API rate limiting is set to 100 requests per minute.
   - WebSocket connection limits to ensure performance.

2. **Security Constraints**
   - Email domain is restricted to nu.edu.pk for user verification.
   - JWT expiration is set to 24 hours for security.
   - Password requirements include:
     - Minimum of 8 characters.
     - Must contain numbers and special characters.
     - Case sensitivity is required.
   - OTP validity is limited to 10 minutes for security.

3. **Business Constraints**
   - One shop is allowed per vendor for operational simplicity.
   - Maximum order value limits to prevent abuse.
   - Payment verification timeout is set to 30 minutes.
   - Order cancellation time limit is 5 minutes post-placement.
   - Menu item limits per shop to ensure manageability.

4. **Integration Constraints**
   - Cloudinary free tier limitations for image storage.
   - Google OAuth quotas for authentication requests.
   - SMTP daily email limits for notifications.
   - Gemini API request limits for payment processing.

### 2.6 User Documentation

1. **Setup Documentation**
   - System requirements for installation.
   - Installation guide for setup.
   - Configuration manual for system settings.
   - Database setup instructions.
   - Environment variables for configuration.

2. **API Documentation**
   - Endpoint descriptions for API usage.
   - Request/response formats for data exchange.
   - Authentication flows for secure access.
   - Error codes for troubleshooting.
   - Rate limits for API usage.

3. **User Guides**
   - Student/Teacher guide for user navigation.
   - Vendor manual for shop management.
   - Admin dashboard guide for system oversight.
   - Payment processing guide for financial transactions.
   - Troubleshooting guide for common issues.

4. **Technical Documentation**
   - System architecture for understanding design.
   - Database schema for data structure.
   - Integration guides for third-party services.
   - Security protocols for data protection.
   - Deployment process for system rollout.

### 2.7 Assumptions and Dependencies

1. **Technical Dependencies**
   ```json
   {
     "dependencies": {
       "node": ">=16.0.0",
       "express": "^4.18.0",
       "mysql2": "^3.0.0",
       "socket.io": "^4.0.0",
       "jsonwebtoken": "^9.0.0",
       "bcrypt": "^5.0.0",
       "cloudinary": "^1.0.0",
       "@google/generative-ai": "^1.0.0"
     }
   }
   ```

2. **External Services**
   - **Google Cloud Platform**
     - OAuth 2.0 for authentication.
     - Gemini AI API for payment validation.
   - **Cloudinary**
     - Image storage and management.
     - Transformation API for image processing.
   - **SMTP Service**
     - Email delivery for notifications.
     - Templates for user communication.

3. **Assumptions**
   - Users have stable internet access for system functionality.
   - Vendors maintain accurate menu information for user satisfaction.
   - Users have access to smartphones or computers for ordering.
   - Payment screenshots are legible for verification.
   - The university email system is reliable for communication.

## 3. UML Concepts and Associations

### 3.1 UML Associations
- **Dual Associations**: Represent relationships between two different classes, such as `User` and `Order`, where a user can place multiple orders.
- **Self-Associations**: Used in cases where a class relates to itself, such as a `Shop` that can have multiple `MenuItems`.
- **Aggregation**: Represents a "whole-part" relationship, such as a `Shop` containing multiple `MenuItems`.
- **Composition**: A stronger form of aggregation where the part cannot exist without the whole, such as `OrderItems` existing only within an `Order`.

### 3.2 Realizations & Dependencies
- **Interface Implementations**: The system uses interfaces for various components, such as `PaymentProcessor` for handling different payment methods.
- **Object Dependencies**: Objects like `Order` depend on `User` and `Shop` objects, indicating that an order cannot exist without a user and a shop.

### 3.3 Advanced UML Elements
- **Parameterized Classes**: Classes like `Order<T>` can be used to define orders for different types of items, allowing for flexibility in item types.
- **Enumerations**: Used for defining fixed sets of constants, such as `OrderStatus` with values like `pending`, `accepted`, `delivered`, etc.
- **Concurrent Objects**: The system may utilize concurrent objects for handling multiple user requests simultaneously, ensuring responsiveness.
- **Active Objects**: Objects that have their own thread of control, such as a `NotificationService` that sends notifications independently of user actions.
- **Subsystem Models**: The system can be divided into smaller modules, such as `UserManagement`, `OrderManagement`, and `PaymentProcessing`, each responsible for specific functionalities.

## 4. External Interface Requirements

### 4.1 User Interfaces

1. **Authentication Interfaces**
   ```javascript
   // Login Screen
   interface LoginScreen {
     email: string;          // nu.edu.pk domain
     password: string;       // encrypted
     googleOAuth: boolean;   // optional
   }

   // Registration Screen
   interface RegistrationScreen {
     userName: string;
     email: string;         // with domain validation
     password: string;      // with strength check
     role: UserRole;        // student/teacher/vendor
   }
   ```

2. **Shop Management Interface**
   ```javascript
   // Shop Dashboard
   interface ShopDashboard {
     analytics: AnalyticsData;
     activeOrders: Order[];
     menuItems: MenuItem[];
     revenue: RevenueStats;
   }

   // Menu Management
   interface MenuManagement {
     items: MenuItem[];
     categories: Category[];
     pricing: PriceInfo;
   }
   ```

3. **Order Interface**
   ```javascript
   // Order Creation
   interface OrderCreation {
     items: CartItem[];
     totalPrice: number;
     paymentDetails: PaymentInfo;
     deliveryNotes: string;
   }

   // Order Tracking
   interface OrderTracking {
     status: OrderStatus;
     timeline: StatusUpdate[];
     paymentStatus: PaymentStatus;
   }
   ```

### 4.2 Hardware Interfaces

1. **Server Requirements**
   - Minimum CPU: 2 cores for processing.
   - RAM: 4GB minimum for performance.
   - Storage: 20GB SSD for data management.
   - Network: 100Mbps minimum for connectivity.

2. **Client Requirements**
   - Modern web browser for user access.
   - Camera (for payment screenshots) for verification.
   - Minimum screen resolution: 320px width for usability.

3. **Database Server**
   - MySQL 8.0+ for data management.
   - 10GB initial storage for database needs.
   - Backup capability for data integrity.
   - Replication support for reliability.

### 4.3 Software Interfaces

1. **Database Schema**
   ```sql
   -- Core Tables
   CREATE TABLE users (
     id VARCHAR(36) PRIMARY KEY,
     user_name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     imageURL VARCHAR(255),
     is_verified BOOLEAN DEFAULT FALSE,
     role VARCHAR(50) DEFAULT 'student',
     alert_count INT DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   CREATE TABLE shops (
     id VARCHAR(36) PRIMARY KEY,
     owner_id VARCHAR(36) NOT NULL,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     image_url VARCHAR(255),
     total_revenue DECIMAL(10, 2) DEFAULT 0.00,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (owner_id) REFERENCES users(id)
   );

   -- Orders table
   CREATE TABLE orders (
     order_id VARCHAR(36) PRIMARY KEY,
     user_id VARCHAR(36) NOT NULL,
     shop_id VARCHAR(36) NOT NULL,
     total_price DECIMAL(10, 2) NOT NULL,
     status ENUM('pending', 'preparing', 'accepted', 'rejected', 'delivered', 'discarded') DEFAULT 'pending',
     payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id),
     FOREIGN KEY (shop_id) REFERENCES shops(id)
   );

   -- Other tables (menu_items, order_items, payments, etc.) would follow a similar structure.
   ```

## 5. System Features

### 5.1 Authentication System
**Priority**: Critical

#### 5.1.1 Description
A comprehensive authentication system supporting email/password and Google OAuth, with domain-restricted registration and OTP verification.

#### 5.1.2 Functional Requirements
- **REQ-1**: Email domain verification (nu.edu.pk only)
- **REQ-2**: OTP verification via email
- **REQ-3**: Google OAuth integration
- **REQ-4**: JWT-based session management
- **REQ-5**: Password encryption and validation
- **REQ-6**: Role-based access control (student, teacher, shop_owner)
- **REQ-7**: Account verification status tracking

### 5.2 Order Management
**Priority**: Critical

#### 5.2.1 Description
Real-time order processing system with status tracking and notifications.

#### 5.2.2 Functional Requirements
- **REQ-8**: Order creation and validation
- **REQ-9**: Real-time status updates via WebSocket
- **REQ-10**: Order history tracking
- **REQ-11**: Multiple item support per order
- **REQ-12**: Order cancellation within time limit
- **REQ-13**: Status change notifications
- **REQ-14**: Price calculation and validation

### 5.3 Payment System
**Priority**: Critical

#### 5.3.1 Description
AI-powered payment verification system using screenshot analysis and multiple payment methods.

#### 5.3.2 Functional Requirements
- **REQ-15**: Payment screenshot upload and storage
- **REQ-16**: Gemini AI integration for verification
- **REQ-17**: Multiple payment method support
  - JazzCash
  - EasyPaisa
  - SadaPay
  - NayaPay
- **REQ-18**: Payment status tracking
- **REQ-19**: Automated verification process
- **REQ-20**: Manual verification fallback

### 5.4 Shop Management
**Priority**: High

#### 5.4.1 Description
Comprehensive shop management system for vendors with menu and order control.

#### 5.4.2 Functional Requirements
- **REQ-21**: Shop profile creation and management
- **REQ-22**: Menu item CRUD operations
- **REQ-23**: Order processing controls
- **REQ-24**: Revenue tracking and analytics
- **REQ-25**: Shop statistics dashboard
- **REQ-26**: Contact information management
- **REQ-27**: Payment method configuration

### 5.5 Analytics and Reporting
**Priority**: Medium

#### 5.5.1 Description
Data-driven insights and reporting system for business intelligence.

#### 5.5.2 Functional Requirements
- **REQ-28**: Sales analytics and trends
- **REQ-29**: Popular items tracking
- **REQ-30**: Customer order patterns
- **REQ-31**: Revenue analysis
  - Daily revenue
  - Monthly trends
  - Payment method distribution
- **REQ-32**: Performance metrics
- **REQ-33**: Custom report generation

### 5.6 Real-time Notification System
**Priority**: High

#### 5.6.1 Description
Multi-channel notification system for order and payment updates.

#### 5.6.2 Functional Requirements
- **REQ-34**: WebSocket real-time updates
- **REQ-35**: Email notifications
- **REQ-36**: Order status notifications
- **REQ-37**: Payment verification alerts
- **REQ-38**: System alerts and warnings
- **REQ-39**: Notification preferences

### 5.7 User Management
**Priority**: High

#### 5.7.1 Description
User profile and preference management system with role-based features.

#### 5.7.2 Functional Requirements
- **REQ-40**: Profile management
- **REQ-41**: Role-based access control
- **REQ-42**: Alert count tracking
- **REQ-43**: Order history access
- **REQ-44**: Payment history tracking
- **REQ-45**: Account verification status

### 5.8 Image Management
**Priority**: Medium

#### 5.8.1 Description
Cloud-based image storage and processing system for menu items and payments.

#### 5.8.2 Functional Requirements
- **REQ-46**: Cloudinary integration
- **REQ-47**: Image upload and storage
- **REQ-48**: Image optimization
- **REQ-49**: Payment screenshot processing
- **REQ-50**: Menu item image management

## 6. Other Nonfunctional Requirements

### 6.1 Performance Requirements
- Response time should be less than 2 seconds for user actions.
- Real-time updates should occur in less than 1 second.
- The system should maintain 99.9% uptime for reliability.
- Support for concurrent users to ensure scalability.

### 6.2 Security Requirements
- Data encryption to protect sensitive information.
- Secure authentication processes to prevent unauthorized access.
- Payment data protection to ensure user financial security.
- Role-based access control to manage user permissions effectively.
- Input validation to prevent security vulnerabilities.

### 6.3 Software Quality Attributes
- **Scalability**: The system should efficiently handle an increasing number of users and transactions without performance degradation. It should support horizontal scaling by adding more servers as needed.
- **Maintainability**: Code should be modular and well-documented to facilitate easy updates and bug fixes. The system should adhere to coding standards and best practices.
- **Reliability**: The system should be available 99.9% of the time, with minimal downtime for maintenance. It should have failover mechanisms in place to ensure continuous operation.
- **Usability**: The user interface should be intuitive and easy to navigate for all user classes. User feedback should be incorporated into design iterations.
- **Performance**: The system should respond to user actions within 2 seconds under normal load conditions. It should efficiently manage database queries and API calls.

### 6.4 Business Rules
- **Vendor Verification Process**: All vendors must undergo a verification process by the university before creating a shop profile. This includes background checks and compliance with university policies.
- **Payment Processing Rules**: Payments must be processed securely, and users should receive confirmation of payment status. Refunds must be initiated within 24 hours of a cancellation request.
- **Order Cancellation Policies**: Users can cancel orders within 5 minutes of placement. After this period, the order cannot be canceled, and the user will be charged.
- **User Rating System**: Users can rate their experience with vendors after order completion. Ratings will be visible to other users and will influence vendor visibility.
- **Refund Policies**: Refunds will be processed within 5-7 business days. Users must provide valid reasons for refunds, which will be reviewed by the admin.

## 7. Other Requirements
- **Backup and Recovery Procedures**: The system must implement daily backups of the database and critical files. Recovery procedures should be tested quarterly to ensure data integrity.
- **Data Retention Policies**: User data will be retained for a minimum of 5 years for compliance purposes. After this period, data will be anonymized or deleted based on user consent.
- **Compliance with University Regulations**: The system must adhere to all university policies regarding data privacy, user consent, and financial transactions.
- **Audit Trail Requirements**: All user actions, especially those involving financial transactions, must be logged for auditing purposes. Logs should be retained for at least 2 years.
- **System Monitoring and Logging**: The system should implement monitoring tools to track performance metrics and error rates. Alerts should be configured for critical failures.

## 8. UML Concepts and Associations

### 8.1 UML Associations
- **Dual Associations**: Represent relationships between two different classes, such as `User` and `Order`, where a user can place multiple orders.
- **Self-Associations**: Used in cases where a class relates to itself, such as a `Shop` that can have multiple `MenuItems`.
- **Aggregation**: Represents a "whole-part" relationship, such as a `Shop` containing multiple `MenuItems`.
- **Composition**: A stronger form of aggregation where the part cannot exist without the whole, such as `OrderItems` existing only within an `Order`.

### 8.2 Realizations & Dependencies
- **Interface Implementations**: The system uses interfaces for various components, such as `PaymentProcessor` for handling different payment methods.
- **Object Dependencies**: Objects like `Order` depend on `User` and `Shop` objects, indicating that an order cannot exist without a user and a shop.

### 8.3 Advanced UML Elements
- **Parameterized Classes**: Classes like `Order<T>` can be used to define orders for different types of items, allowing for flexibility in item types.
- **Enumerations**: Used for defining fixed sets of constants, such as `OrderStatus` with values like `pending`, `accepted`, `delivered`, etc.
- **Concurrent Objects**: The system may utilize concurrent objects for handling multiple user requests simultaneously, ensuring responsiveness.
- **Active Objects**: Objects that have their own thread of control, such as a `NotificationService` that sends notifications independently of user actions.
- **Subsystem Models**: The system can be divided into smaller modules, such as `UserManagement`, `OrderManagement`, and `PaymentProcessing`, each responsible for specific functionalities.

## 9. External Interface Requirements

### 9.1 User Interfaces

1. **Authentication Interfaces**
   ```javascript
   // Login Screen
   interface LoginScreen {
     email: string;          // nu.edu.pk domain
     password: string;       // encrypted
     googleOAuth: boolean;   // optional
   }

   // Registration Screen
   interface RegistrationScreen {
     userName: string;
     email: string;         // with domain validation
     password: string;      // with strength check
     role: UserRole;        // student/teacher/vendor
   }
   ```

2. **Shop Management Interface**
   ```javascript
   // Shop Dashboard
   interface ShopDashboard {
     analytics: AnalyticsData;
     activeOrders: Order[];
     menuItems: MenuItem[];
     revenue: RevenueStats;
   }

   // Menu Management
   interface MenuManagement {
     items: MenuItem[];
     categories: Category[];
     pricing: PriceInfo;
   }
   ```

3. **Order Interface**
   ```javascript
   // Order Creation
   interface OrderCreation {
     items: CartItem[];
     totalPrice: number;
     paymentDetails: PaymentInfo;
     deliveryNotes: string;
   }

   // Order Tracking
   interface OrderTracking {
     status: OrderStatus;
     timeline: StatusUpdate[];
     paymentStatus: PaymentStatus;
   }
   ```

### 9.2 Hardware Interfaces

1. **Server Requirements**
   - Minimum CPU: 2 cores for processing.
   - RAM: 4GB minimum for performance.
   - Storage: 20GB SSD for data management.
   - Network: 100Mbps minimum for connectivity.

2. **Client Requirements**
   - Modern web browser for user access.
   - Camera (for payment screenshots) for verification.
   - Minimum screen resolution: 320px width for usability.

3. **Database Server**
   - MySQL 8.0+ for data management.
   - 10GB initial storage for database needs.
   - Backup capability for data integrity.
   - Replication support for reliability.

### 9.3 Software Interfaces

1. **Database Schema**
   ```sql
   -- Core Tables
   CREATE TABLE users (
     id VARCHAR(36) PRIMARY KEY,
     user_name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     imageURL VARCHAR(255),
     is_verified BOOLEAN DEFAULT FALSE,
     role VARCHAR(50) DEFAULT 'student',
     alert_count INT DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   CREATE TABLE shops (
     id VARCHAR(36) PRIMARY KEY,
     owner_id VARCHAR(36) NOT NULL,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     image_url VARCHAR(255),
     total_revenue DECIMAL(10, 2) DEFAULT 0.00,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (owner_id) REFERENCES users(id)
   );

   -- Orders table
   CREATE TABLE orders (
     order_id VARCHAR(36) PRIMARY KEY,
     user_id VARCHAR(36) NOT NULL,
     shop_id VARCHAR(36) NOT NULL,
     total_price DECIMAL(10, 2) NOT NULL,
     status ENUM('pending', 'preparing', 'accepted', 'rejected', 'delivered', 'discarded') DEFAULT 'pending',
     payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id),
     FOREIGN KEY (shop_id) REFERENCES shops(id)
   );

   -- Other tables (menu_items, order_items, payments, etc.) would follow a similar structure.
   ```

## 10. System Features

### 10.1 Authentication System
**Priority**: High

#### 10.1.1 Description
A multi-method authentication system supporting both email/password and Google OAuth for secure user access.

#### 10.1.2 Functional Requirements
- **REQ-1**: Email domain verification to ensure valid user accounts.
- **REQ-2**: OTP verification for enhanced security during login.
- **REQ-3**: Google OAuth integration for seamless authentication.
- **REQ-4**: Session management to maintain user state across sessions.
- **REQ-5**: Password encryption to protect user credentials.

### 10.2 Order Management
**Priority**: High

#### 10.2.1 Description
A comprehensive order processing system that provides real-time updates and efficient handling of customer requests.

#### 10.2.2 Functional Requirements
- **REQ-6**: Order creation and tracking for user convenience.
- **REQ-7**: Real-time status updates to keep users informed.
- **REQ-8**: Payment processing for secure transactions.
- **REQ-9**: Order history for user reference and tracking.
- **REQ-10**: Notification system to alert users of order status changes.

## 11. Other Nonfunctional Requirements

### 11.1 Performance Requirements
- Response time should be less than 2 seconds for user actions.
- Real-time updates should occur in less than 1 second.
- The system should maintain 99.9% uptime for reliability.
- Support for concurrent users to ensure scalability.

### 11.2 Security Requirements
- Data encryption to protect sensitive information.
- Secure authentication processes to prevent unauthorized access.
- Payment data protection to ensure user financial security.
- Role-based access control to manage user permissions effectively.
- Input validation to prevent security vulnerabilities.

### 11.3 Software Quality Attributes
- **Scalability**: The system should efficiently handle an increasing number of users and transactions without performance degradation. It should support horizontal scaling by adding more servers as needed.
- **Maintainability**: Code should be modular and well-documented to facilitate easy updates and bug fixes. The system should adhere to coding standards and best practices.
- **Reliability**: The system should be available 99.9% of the time, with minimal downtime for maintenance. It should have failover mechanisms in place to ensure continuous operation.
- **Usability**: The user interface should be intuitive and easy to navigate for all user classes. User feedback should be incorporated into design iterations.
- **Performance**: The system should respond to user actions within 2 seconds under normal load conditions. It should efficiently manage database queries and API calls.

### 11.4 Business Rules
- **Vendor Verification Process**: All vendors must undergo a verification process by the university before creating a shop profile. This includes background checks and compliance with university policies.
- **Payment Processing Rules**: Payments must be processed securely, and users should receive confirmation of payment status. Refunds must be initiated within 24 hours of a cancellation request.
- **Order Cancellation Policies**: Users can cancel orders within 5 minutes of placement. After this period, the order cannot be canceled, and the user will be charged.
- **User Rating System**: Users can rate their experience with vendors after order completion. Ratings will be visible to other users and will influence vendor visibility.
- **Refund Policies**: Refunds will be processed within 5-7 business days. Users must provide valid reasons for refunds, which will be reviewed by the admin.

## 12. Other Requirements
- **Backup and Recovery Procedures**: The system must implement daily backups of the database and critical files. Recovery procedures should be tested quarterly to ensure data integrity.
- **Data Retention Policies**: User data will be retained for a minimum of 5 years for compliance purposes. After this period, data will be anonymized or deleted based on user consent.
- **Compliance with University Regulations**: The system must adhere to all university policies regarding data privacy, user consent, and financial transactions.
- **Audit Trail Requirements**: All user actions, especially those involving financial transactions, must be logged for auditing purposes. Logs should be retained for at least 2 years.
- **System Monitoring and Logging**: The system should implement monitoring tools to track performance metrics and error rates. Alerts should be configured for critical failures.

## 13. Appendices
### 13.1 Glossary
- **CFOS**: Campus Food Ordering System
- **JWT**: JSON Web Token
- **API**: Application Programming Interface
- **OTP**: One-Time Password
- **UI**: User Interface
- **UX**: User Experience

### 13.2 Change Log
| Date       | Version | Description                          | Author         |
|------------|---------|--------------------------------------|-----------------|
| 2023-10-01 | 1.0     | Initial version of the SRS document | Project Team    |
| 2023-10-15 | 1.1     | Added detailed user roles and features | Project Team    |
| 2023-10-20 | 1.2     | Updated performance and security requirements | Project Team    |
| 2023-10-25 | 1.3     | Enhanced descriptions and professionalism throughout the document | Project Team    |
| 2023-10-30 | 1.4     | Comprehensive review and updates to reflect codebase and functionalities | Project Team    |

### 13.3 Contact Information
For any questions or clarifications regarding this document, please contact:
- **Project Manager**: [Name] - [Email]
- **Lead Developer**: [Name] - [Email]
- **System Administrator**: [Name] - [Email]

### 13.4 Related Documents
- **Vision and Scope Document**: [Link]
- **User Interface Design Document**: [Link]
- **Technical Architecture Document**: [Link]
- **Test Plan Document**: [Link] 