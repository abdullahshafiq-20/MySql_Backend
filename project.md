# Software Requirements Specification - Campus Food Ordering System

## 1. SRS in IEEE Format

### 1.1 Introduction

#### 1.1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to provide a detailed description of the Campus Food Ordering System (CFOS). This document serves as a comprehensive guide for developers, project managers, and stakeholders, outlining the system's intended features, functionalities, and constraints. It aims to ensure a shared understanding of the system's requirements and facilitate effective communication among all parties involved in the project.

#### 1.1.2 Scope
CFOS is a web-based platform designed to facilitate food ordering for university campuses. The system will allow students and faculty to place orders from various campus food vendors, manage payments, and receive real-time notifications about their orders. Additionally, the system will provide vendors with tools to manage their menus, track orders, and analyze sales data. The scope includes the development of a user-friendly interface, robust backend services, and secure payment processing capabilities.

#### 1.1.3 Definitions, Acronyms, and Abbreviations
- **CFOS**: Campus Food Ordering System
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **OTP**: One-Time Password
- **UI**: User Interface
- **UX**: User Experience
- **CRUD**: Create, Read, Update, Delete

### 1.2 Overall Description

#### 1.2.1 System Environment
The CFOS will operate in a cloud-based environment, utilizing Node.js for the backend, React.js for the frontend, and MySQL for database management. The system will be accessible via modern web browsers on various devices, including desktops, tablets, and smartphones. The architecture will support scalability to accommodate a growing user base and increased transaction volume.

#### 1.2.2 User Characteristics
- **Students**: Primary users who will place orders, manage payments, and track their order history. They are expected to be tech-savvy and familiar with online ordering systems.
- **Teachers**: Secondary users with similar functionalities as students but may have higher priority for orders due to their roles. They may also require additional features for managing group orders.
- **Shop Owners**: Users who manage their shops, menus, and orders. They will need access to analytics and reporting tools to track sales and customer preferences.
- **System Administrators**: Users responsible for managing the system, user accounts, and overall maintenance. They will ensure the system operates smoothly and securely.

#### 1.2.3 Assumptions
- Users will have stable internet access to utilize the system effectively.
- Vendors will maintain accurate and up-to-date menu information for user satisfaction.
- Users will have access to devices capable of running modern web browsers, ensuring compatibility with the system.

#### 1.2.4 Constraints
- The system must comply with university policies regarding data privacy and user consent.
- The maximum file upload size for images is limited to 5MB to ensure efficient storage and processing.
- The system must support a minimum of 100 concurrent users to handle peak usage times effectively.

## 2. Specific Requirements

### 2.1 Functional Requirements
- **User Authentication**: Users must be able to register, log in, and manage their profiles securely. This includes email/password authentication and Google OAuth integration.
- **Order Management**: Users can place, track, and manage their orders. They should be able to view order history and receive notifications about order status changes.
- **Payment Processing**: The system must securely handle payments, including payment verification and transaction history. Users should be able to upload payment screenshots for verification.
- **Vendor Management**: Vendors can create and manage their shop profiles, including menu items, pricing, and operating hours. They should also have access to analytics for sales tracking.

### 2.2 Non-Functional Requirements
- **Performance**: The system should respond to user actions within 2 seconds to ensure a smooth user experience.
- **Security**: User data must be encrypted, and secure authentication methods must be implemented to protect sensitive information.
- **Usability**: The user interface should be intuitive and easy to navigate, with clear instructions and feedback for users.

### 2.3 Design Constraints
- The system must be developed using Node.js and React.js to leverage their capabilities for building scalable web applications.
- The database must be implemented using MySQL, ensuring data integrity and efficient querying.

## 3. UML Concepts and Associations

### 3.1 UML Associations
- **Dual Associations**: Relationships between `User` and `Order` classes, where a user can place multiple orders, and each order is associated with a single user.
- **Self-Associations**: A `Shop` can have multiple `MenuItems`, indicating that a shop can offer various food items.
- **Aggregation**: Represents a "whole-part" relationship, such as a `Shop` containing multiple `MenuItems`, where the shop can exist independently of the menu items.
- **Composition**: A stronger form of aggregation where the part cannot exist without the whole, such as `OrderItems` existing only within an `Order`.

### 3.2 Realizations & Dependencies
- **Interface Implementations**: The system uses interfaces for components like `PaymentProcessor`, which defines methods for processing payments.
- **Object Dependencies**: The `Order` object depends on `User` and `Shop` objects, indicating that an order cannot exist without a user and a shop.

### 3.3 Advanced UML Elements
- **Parameterized Classes**: Classes like `Order<T>` can be used to define orders for different types of items, allowing for flexibility in item types.
- **Enumerations**: Used for defining fixed sets of constants, such as `OrderStatus` with values like `pending`, `accepted`, `delivered`, etc.
- **Concurrent Objects**: The system may utilize concurrent objects for handling multiple user requests simultaneously, ensuring responsiveness.
- **Active Objects**: Objects that have their own thread of control, such as a `NotificationService` that sends notifications independently of user actions.
- **Subsystem Models**: The system can be divided into smaller modules, such as `UserManagement`, `OrderManagement`, and `PaymentProcessing`, each responsible for specific functionalities.

## 4. Software Development Strategy

### 4.1 Process Model Strategy
The Agile methodology will be employed for the development of CFOS. This approach allows for iterative development, enabling the team to adapt to changes quickly and incorporate user feedback throughout the development process. Agile is selected due to its flexibility and focus on delivering functional software in short cycles, which is essential for a project with evolving requirements.

### 4.2 Homogenization Process
To standardize processes and integrate system elements, the development team will adopt coding standards, use version control (Git), and implement continuous integration/continuous deployment (CI/CD) practices. This ensures consistency across the codebase and facilitates collaboration among team members. Regular code reviews and documentation will further enhance the quality and maintainability of the code.

## 5. Feasibility Report

### 5.1 Technical Feasibility
The project is technically feasible as the required technologies (Node.js, React.js, MySQL) are well-supported and widely used in the industry. The development team has the necessary skills and experience to implement the system effectively.

### 5.2 Economic Feasibility
The project is economically viable, with potential revenue from vendor subscriptions and transaction fees. Initial costs will be offset by these revenue streams, and a detailed financial analysis will be conducted to ensure profitability.

### 5.3 Operational Feasibility
The system will be user-friendly, catering to the needs of students, faculty, and vendors, ensuring high adoption rates. Training sessions and user support will be provided to facilitate smooth onboarding.

### 5.4 Schedule Feasibility
The project timeline is realistic, with a proposed completion date of six months, allowing for adequate development, testing, and deployment phases. A detailed project plan will be maintained to track progress and adjust timelines as necessary.

## 6. Project Plan

### 6.1 Milestones
- **Project Kickoff**: Week 1
- **Requirements Gathering**: Weeks 2-3
- **Development Phase**: Weeks 4-12
- **Testing Phase**: Weeks 13-14
- **Deployment**: Week 15
- **Project Review**: Week 16

### 6.2 Timeline (Gantt Chart)
| Milestone                | Start Date | End Date   |
|--------------------------|------------|------------|
| Project Kickoff          | Week 1    | Week 1     |
| Requirements Gathering    | Week 2    | Week 3     |
| Development Phase        | Week 4    | Week 12    |
| Testing Phase            | Week 13   | Week 14    |
| Deployment               | Week 15   | Week 15    |
| Project Review           | Week 16   | Week 16    |

### 6.3 Resources Required
- Development Team: 4 Developers, 1 Project Manager, 1 QA Tester
- Tools: Git, JIRA, Postman, MySQL Workbench
- Hosting: Cloud service provider (e.g., AWS, Vercel)

### 6.4 Risks and Mitigation Strategies
- **Risk**: Delays in development due to unforeseen technical challenges.
  - **Mitigation**: Regular sprint reviews and adjustments to the project plan.
- **Risk**: Low user adoption.
  - **Mitigation**: Conduct user training sessions and gather feedback for improvements.

## 7. Systems Architecture

### 7.1 Architecture Overview
The CFOS will utilize a three-tier architecture consisting of:
- **Presentation Layer**: The user interface built with React.js, providing an interactive experience for users.
- **Business Logic Layer**: Node.js/Express.js handling the application logic, processing user requests, and managing data flow.
- **Data Layer**: MySQL database for data storage, ensuring data integrity and efficient querying.

### 7.2 Architecture Diagrams
- **Three-Tier Architecture Diagram**: [Insert Diagram Here]
- **Component Interaction Diagram**: [Insert Diagram Here]

## 8. Database Details

### 8.1 SQL Scripts
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

-- Additional tables (orders, menu_items, etc.) would follow a similar structure.
```

### 8.2 Database Schema Backup
- A backup of the database schema will be provided in a `.sql` file format, ensuring that the structure can be restored if needed.

## 9. Source Code

### 9.1 Full Working Software Source Code
The complete source code for the CFOS will be provided in a Git repository, ensuring it is clean, well-documented, and follows best practices. The repository will include:
- Clear README documentation for setup and usage.
- Comments within the code to explain complex logic and functionality.

### 9.2 Integration of UML-Generated Code
The integration of UML-generated code with custom logic will be highlighted in the documentation, showcasing how design elements translate into functional code. This will include:
- Examples of how UML diagrams inform the structure of classes and interfaces in the codebase.

## 10. Deployment

### 10.1 Hosting the Project
The CFOS will be deployed on a free hosting platform, such as Vercel or Render. Detailed steps for deployment will be included in the documentation, covering:
- Environment setup.
- Configuration of environment variables.
- Deployment commands and procedures.

### 10.2 Testing the Deployment
Post-deployment testing will be conducted to ensure all functionalities work as expected. This will include:
- Functional testing of all user interactions.
- Performance testing to ensure the system meets response time requirements.

## 11. Object Interface Specification

### 11.1 IDL (Interface Description Language)
The IDL will define interfaces for components or services, ensuring clear communication between different parts of the system. This will include:
- Definitions of service interfaces for user management, order processing, and payment handling.

## 12. Final Deliverables

### 12.1 Presentation
A comprehensive presentation will cover all diagrams, architecture, and strategies related to the CFOS. This will be prepared for stakeholders to provide an overview of the project.

### 12.2 UML Files
- Papyrus project file and UML diagrams exported in PNG format will be included to illustrate the system design.

### 12.3 Project Report
A detailed project report will provide a comprehensive explanation of diagrams and processes, including:
- Insights into the development process.
- Challenges faced and solutions implemented.

### 12.4 Software Demonstration
A demonstration of the software functionality will be prepared for stakeholders, showcasing the key features of the CFOS and how they meet user needs. 