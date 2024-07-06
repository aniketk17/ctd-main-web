# Event Registration Platform

A web application built with Node.js, Express, and PostgreSQL to manage event registrations for both individuals and teams. This project includes user authentication, event management, cart functionality, and payment processing.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## Features

- User registration and authentication
- Event listing and details
- Individual and team registrations
- Add events to cart
- Payment processing
- Separate handling for individual and team registrations
- Admin panel for event and user management (optional)

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize (ORM)
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment variable management

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/event-registration-platform.git
    cd event-registration-platform
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root of the project and add the following:

    ```plaintext
    DATABASE_URL=your_database_url
    JWT_SECRET=your_jwt_secret
    PORT=your_port
    ```

4. Set up the database:

    Make sure you have PostgreSQL installed and running. Then, create a new database:

    ```sh
    createdb event_registration
    ```

    Run the database migrations to create the tables:

    ```sh
    npx sequelize-cli db:migrate
    ```

5. Start the server:

    ```sh
    npm start
    ```

    The server will start on the port specified in your `.env` file.

## Usage

1. Register as a new user.
2. Log in with your credentials.
3. Browse available events.
4. Add events to your cart as an individual or as a team.
5. Proceed to checkout and complete the payment process.

## API Endpoints

### Authentication

- `POST /api/register`: Register a new user
- `POST /api/login`: Log in and obtain a JWT token

### Events

- `GET /api/events`: Get a list of all events
- `GET /api/events/:id`: Get details of a specific event

### Cart

- `POST /api/cart`: Add an event to the cart
- `GET /api/cart`: Get the current user's cart items
- `DELETE /api/cart/:id`: Remove an event from the cart

### Registration

- `POST /api/register-event`: Register for an event as an individual or a team

### Payment

- `POST /api/payments`: Process a payment