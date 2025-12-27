require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Fixed typo here (was constHZ)

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Configuration
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Serve Static Files (Frontend)
// NOTE: Ensure index.html, style.css, and script.js are inside a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/tasks', require('./routes/tasks'));

// Handle SPA (Single Page Application) Support
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));