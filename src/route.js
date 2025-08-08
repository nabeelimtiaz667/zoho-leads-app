const express = require('express');
const ZohoCRMService = require('./services/ZohoCRMService');

const router = express.Router();

// Test Node app working
router.get('/test', (req, res) => res.send('API is working!'));

router.post('/leads', async (req, res) => {
    try {
        console.log('Received raw request:', req.body);
        const leadData = req.body;
        console.log('Parsed lead data:', leadData);
        const result = await ZohoCRMService.addLead(leadData);
        res.status(201).json({ message: 'Lead created', data: result });
    } catch (error) {
        console.error('Error creating lead:', error.message);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

module.exports = router