const express = require('express');
const ZohoCRMService = require('./services/ZohoCRMService');

const router = express.Router();

router.post('/leads', async (req, res) => {
    try {
        console.log('Received raw request:', req.body);
        const leadData = req.body;
        console.log('Parsed lead data:', leadData);
        if (!leadData || !leadData.First_Name || !leadData.Last_Name || !leadData.Email) {
            console.log('Validation failed. Lead data:', leadData);
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await ZohoCRMService.addLead(leadData);
        res.status(201).json({ message: 'Lead created', data: result });
    } catch (error) {
        console.error('Error creating lead:', error.message);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

module.exports = router;