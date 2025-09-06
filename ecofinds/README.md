EcoFinds: A Sustainable Second-Hand Marketplace
Project Overview
EcoFinds is a second-hand marketplace designed to empower sustainable consumption by extending the lifecycle of products. The platform aims to be a central hub for a conscious community, making it easy to buy and sell pre-owned goods and promote a circular economy.

This project focuses on building the foundational backend and frontend functionalities required for a marketplace, with a strong emphasis on a robust database design.

Core Features (MVP)
The initial version of EcoFinds includes the following core functionalities:

User Authentication: Secure registration and login for all users.

User Dashboard: A simple dashboard to manage profile information.

Product Listings: Create, view, edit, and delete product listings with details like title, description, category, and price.

Product Browsing: A basic product feed with search and filtering capabilities.

Cart and Purchases: Functionality to add items to a cart and a view for previous purchases.

Comprehensive Database: A well-structured MySQL database to manage users, listings, orders, transactions, and points.

Technologies
Backend: Python

Database: MySQL

Frontend: HTML, CSS, JavaScript

Database Design
The project's database schema, built using MySQL, is designed to support core marketplace functionalities and includes tables for:

users: User authentication, roles, and profile information.

listings: All product listings with details and seller information.

orders: Tracking purchases and managing the escrow-like payment flow.

transactions: A log of all payments and payouts.

points: A system for rewarding users with points based on transaction value.

Getting Started
To set up and run the EcoFinds project, follow these steps.

Prerequisites
Python 3.x

MySQL Server

A code editor (e.g., VS Code) and a terminal

1. Clone the Repository
git clone <repository_url>
cd ecofinds

2. Database Setup
You have already completed the database design. Ensure your MySQL database is set up with the required schema and is accessible.

3. Backend Setup
Navigate to the backend directory, install the required Python libraries, and set your database credentials as an environment variable.

cd backend

# Installing dependencies
pip install Flask Flask-SQLAlchemy PyMySQL Werkzeug

# Setting  the database connection URL 
# On macOS/Linux:
export DATABASE_URL="mysql+pymysql://root:my_password@localhost/ecofinds_db"

# On Windows (PowerShell):
$env:DATABASE_URL="mysql+pymysql://root:my_password@localhost/ecofinds_db"

4. Run the Application
From the backend directory, start the Flask server. This will also automatically create the database tables if they don't already exist.

python app.py

Directory Structure
ecofinds/
├── backend/
│   ├── app.py              # Main Flask application with API endpoints
│   ├── config.py           # Database and application configuration
│   ├── requirements.txt    # Python dependency list
│   └── .gitignore          # Files to be ignored by Git
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Frontend styling
│   └── main.js             # Frontend JavaScript logic
└── README.md
