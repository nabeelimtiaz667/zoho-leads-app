const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const route = require('./src/route.js');
const ZohoOauthController = require('./src/controllers/ZohoOauthController.js');

require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies with error handling
app.use(cors());
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

app.use('/api', route);

app.get('/', (req, res) => {
    // Start OAuth2.0 flow
    const client_id = process.env.ZOHO_CLIENT_ID;
    const redirect_uri = process.env.ZOHO_REDIRECT_URL;
    const scope = "ZohoCRM.modules.ALL,ZohoCRM.settings.READ";
    const accessType = "offline";
    const responseType = "code";
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=${responseType}&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}&access_type=${accessType}`;
    console.log('Redirecting to Zoho OAuth URL:', authUrl);
    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) return res.status(400).send('No code provided');
        const tokens = await ZohoOauthController.generateTokens(code);
        res.json(tokens);
    } catch (error) {
        res.status(500).send(`Error generating tokens: ${error.message}`);
    }
});

cron.schedule('*/50 * * * *', async () => {
    console.log('Refreshing access token...');
    try {
        await ZohoOauthController.refreshAccessToken();
    } catch (error) {
        console.error('Token refresh failed:', error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. ENV Loaded: ${process.env.PORT || "False."}`));