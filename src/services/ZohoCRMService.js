const axios = require('axios');
const ZohoOauthController = require('../controllers/ZohoOauthController');

class ZohoCRMService {
    async addLead(leadData) {
        try {
            const accessToken = await ZohoOauthController.getValidAccessToken();
            console.log('Using access token:', accessToken);

            const leadPayload = leadData.data;
            console.log('Sending lead payload:', leadPayload);
            // For now return data as promise
            // const response = await new Promise((resolve) => {
            //     resolve(leadPayload);
            // });
            // return response;
            const response = await axios.post(
                'https://www.zohoapis.com/crm/v8/Leads',
                leadPayload,
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating lead:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = new ZohoCRMService();