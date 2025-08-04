const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');

require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies with error handling
app.use(express.json({ strict: true, limit: '10mb' }));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Malformed JSON request:', err.message, 'Raw body:', req.body);
        return res.status(400).json({ error: 'Malformed JSON request' });
    }
    next();
});

app.use((req, res, next) => {
    console.log('Raw request body:', req.body);
    next();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));