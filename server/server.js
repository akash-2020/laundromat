const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = process.env.MONGO_URI.replace('localhost', '127.0.0.1');

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB successfully connected'))
  .catch(err => console.log(err));

const users = {
  username: 'akash',
  password: 'akash'
};

// Import the Customer and Laundry models
const Customer = require('./models/Customer');
const Laundry = require('./models/Laundry');

const checkAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    req.flash('error', 'Unauthorized');
    res.status(401).send('Unauthorized');
  }
};

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);

// Initialize connect-flash
app.use(flash());

// Route to add a new customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, address, phoneNumber } = req.body;
    const customer = new Customer({ name, address, phoneNumber });
    await customer.save();
    req.flash('success', 'Customer added successfully');
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error adding customer:', error);
    req.flash('error', 'Failed to add customer');
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// Route to search for customers by name or phone number
app.get('/api/customers/search', async (req, res) => {
  try {
    const { query } = req.query;
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(customers);
  } catch (error) {
    console.error('Error searching for customers:', error);
    res.status(500).json({ error: 'Failed to search for customers' });
  }
});

// Route to fetch all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/laundries', async (req, res) => {
  try {
    const laundries = await Laundry.find().populate('customerId', 'name phoneNumber');
    res.json(laundries);
  } catch (error) {
    console.error('Error fetching laundries:', error);
    res.status(500).json({ error: 'Failed to fetch laundries' });
  }
});

// Route to add new laundry details for a customer
app.post('/api/customers/:customerId/laundry', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { dropOffDate, pickUpDate, loads, price } = req.body;
    const laundry = new Laundry({ customerId, dropOffDate, pickUpDate, loads, price });
    await laundry.save();

    // Populate the customer details for the saved laundry
    const populatedLaundry = await Laundry.populate(laundry, { path: 'customerId' });

    res.status(201).json(populatedLaundry);
  } catch (error) {
    console.error('Error adding laundry:', error);
    res.status(500).json({ error: 'Failed to add laundry' });
  }
});

// Route to get laundry history for a customer
app.get('/api/customers/:customerId/laundry', async (req, res) => {
  try {
    const { customerId } = req.params;
    const laundryHistory = await Laundry.find({ customerId });
    res.json(laundryHistory);
  } catch (error) {
    console.error('Error fetching laundry history:', error);
    res.status(500).json({ error: 'Failed to fetch laundry history' });
  }
});

// Route for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Attempting login for user: ${username}`);

  const user = users.username;
  if (user && password === users.password) {
    req.session.user = username;
    console.log(`Login successful for user: ${username}`);
    res.send({ login: 'successful', user: username });
  } else {
    console.log(`Incorrect password for user: ${username}`);
    res.status(401).send({ login: 'failed', message: 'Incorrect password' });
  }
});

// Route for user logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).send('Could not log out, please try again.');
    } else {
      res.send({ logout: 'successful' });
    }
  });
});

// Protected route
app.get('/protected', checkAuth, (req, res) => {
  res.send({ message: 'Welcome to the protected route!', user: req.session.user });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
