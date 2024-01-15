const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Check the database connection
db.getConnection()
    .then(connection => {
        console.log('Connected to the database');
        connection.release();
    })
    .catch(error => {
        console.error('Error connecting to the database:', error);
    });

// Registration endpoint
app.post('/api/signup', async (req, res) => {
    try {
        // Extract user details from the request body
        const { firstName, lastName, email, password } = req.body;

        // Log the extracted user details
        console.log('User Details:', { firstName, lastName, email, password });

        // Generate a unique verification token using uuid
        const verificationToken = uuidv4();

        // Store user details and verification token in the database
        const result = await db.query('INSERT INTO users (firstName, lastName, email, password, verificationToken) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, password, verificationToken]);

        // Send a verification email
        await sendVerificationEmail(email, verificationToken);

        // Respond with a success message or any other relevant data
        res.status(200).json({ message: 'Registration successful. Check your email for verification.' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get products from database
app.get('/api/products', async (req, res) => {
    try {
        const sql = 'SELECT * FROM products';

        // Use promise-based query
        const [results] = await db.query(sql);

        // Send the results as a JSON response
        res.json(results);
    } catch (error) {
        console.error('Error executing SQL query:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
