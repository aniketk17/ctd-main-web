# Event Registration Platform

A web application built with Node.js, Express, and PostgreSQL to manage event registrations for both individuals and teams. This project includes user authentication, event management, cart functionality, and payment processing.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Docker Support](#docker-support)

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

## Docker Support

This project is set up to run in a Docker environment, allowing for easier deployment and scalability. Follow these steps to get the application running with Docker.

### Prerequisites

- Ensure you have [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Docker Setup

1. **Clone the repository** (if you haven't already):

    ```sh
    git clone https://github.com/yourusername/event-registration-platform.git
    cd event-registration-platform
    ```

2. **Create a `Dockerfile`**:

    Create a `Dockerfile` in the root of your project with the following content:

    ```dockerfile
    # Use the official Node.js image
    FROM node:18

    # Set the working directory
    WORKDIR /app

    # Copy package.json and package-lock.json
    COPY package*.json ./

    # Install dependencies
    RUN npm install

    # Copy the rest of the application code
    COPY . .

    # Set environment variables
    ENV NODE_ENV=production

    # Expose the application port
    EXPOSE 3000

    # Start the application
    CMD ["npm", "start"]
    ```

3. **Create a `docker-compose.yml`**:

    Create a `docker-compose.yml` file in the root of your project with the following content:

    ```yaml
    version: '3.8'

    services:
      db:
        image: postgres:latest
        environment:
          POSTGRES_USER: your_db_user
          POSTGRES_PASSWORD: your_db_password
          POSTGRES_DB: event_registration
        ports:
          - "5432:5432"

      web:
        build: .
        environment:
          DATABASE_URL: postgres://your_db_user:your_db_password@db:5432/event_registration
          JWT_SECRET: your_jwt_secret
          PORT: 3000
        ports:
          - "3000:3000"
        depends_on:
          - db
    ```

### Building and Running with Docker

1. **Build the Docker images**:

    Navigate to the root of your project and run:

    ```sh
    docker-compose build
    ```

2. **Run the Docker containers**:

    After building the images, start the containers with:

    ```sh
    docker-compose up
    ```

    This command will start both the PostgreSQL database and the Node.js application. The application will be accessible at `http://localhost:3000`.

3. **Stopping the Containers**:

    To stop the running containers, use:

    ```sh
    docker-compose down
    ```

### Database Initialization

To initialize your PostgreSQL database with tables, you can run migrations inside the running container. Open a new terminal window and execute:

```sh
docker-compose exec web npx sequelize-cli db:migrate
