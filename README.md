# Laundromat Operator

Laundromat Operator is a management system designed to streamline the operations of a laundromat store. It provides a user-friendly interface and leverages modern technologies for efficient management of various tasks.

## Features

- **Customer Management:** Easily add new customers and maintain customer records.
- **History Search:** Quickly search and retrieve customer history for efficient service.
- **Laundry Order Management:** Manage laundry orders with ease, including adding new orders and updating statuses.
- **CSV Export:** Export laundry orders to CSV format for easy data handling and reporting.

## Tech Stack

### Client (Frontend)

- **Framework:** TypeScript, styled-components

### Server (Backend)

- **Framework:** Node.js
- **Database:** MongoDB
- **Additional Tools:** MSSQL for specific data handling needs

## Installation

To install and run Laundromat Operator locally, follow these steps:

Clone the repository
```bash
git clone https://github.com/your/repository.git
```

### Client Installation

1. Navigate to the client directory
   
```bash
cd repository-directory/client
```
2. Install client dependencies
```bash
npm install
```
### Server Installation
1. Navigate to the server directory.

```bash
cd ../server
```
2. Install server dependencies

```bash
npm install
```
# Usage

Start the server

```bash
npm start
```
Navigate back to client and start the client

```bash
cd ../client
npm start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URI` = mongodb://change_as_per_your_requirement

`SESSION_SECRET` = any_secret_key_text

Access the application through your web browser at http://localhost:3000.

## Features

- Use the intuitive interface to manage customers
- Handle laundry orders
- Export data as needed


Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please submit an issue or a pull request.
