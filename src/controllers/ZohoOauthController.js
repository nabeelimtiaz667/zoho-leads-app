const axios = require('axios');
const filePersistence = require('../utils/ZohoOauth.js');

class ZohoOauthController {
    async generateTokens(grantToken) {
        try {
            console.log('Generating tokens with grantToken:', grantToken);
            console.log('Using client_id:', process.env.ZOHO_CLIENT_ID);
            console.log('Using client_secret:', process.env.ZOHO_CLIENT_SECRET);
            console.log('Using redirect_uri:', process.env.ZOHO_REDIRECT_URL);

            const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
                params: {
                    grant_type: 'authorization_code',
                    client_id: process.env.ZOHO_CLIENT_ID,
                    client_secret: process.env.ZOHO_CLIENT_SECRET,
                    redirect_uri: process.env.ZOHO_REDIRECT_URL,
                    code: grantToken
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('OAuth response:', response.data);

            const { access_token, refresh_token, expires_in } = response.data;
            if (!access_token || !refresh_token || !expires_in) {
                throw new Error('Invalid OAuth response: ' + JSON.stringify(response.data));
            }

            const tokenObject = {
                user_identifier: process.env.ZOHO_USER_EMAIL,
                access_token,
                refresh_token,
                expires_in: Date.now() + expires_in * 1000
            };

            await filePersistence.updateOAuthTokens(tokenObject);

            return {
                access_token,
                refresh_token,
                expires_in
            };
        } catch (error) {
            console.error('Error generating tokens:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async refreshAccessToken() {
        try {
            const tokenData = await filePersistence.getOAuthTokens(process.env.ZOHO_USER_EMAIL);
            if (!tokenData || !tokenData.refresh_token) throw new Error('No refresh token found');

            const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
                params: {
                    refresh_token: tokenData.refresh_token,
                    grant_type: 'refresh_token',
                    client_id: process.env.ZOHO_CLIENT_ID,
                    client_secret: process.env.ZOHO_CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, expires_in } = response.data;
            if (!access_token || !expires_in) {
                throw new Error('Invalid refresh token response: ' + JSON.stringify(response.data));
            }

            const tokenObject = {
                user_identifier: process.env.ZOHO_USER_EMAIL,
                access_token,
                expires_in: Date.now() + expires_in * 1000,
                refresh_token: tokenData.refresh_token
            };

            await filePersistence.updateOAuthTokens(tokenObject);
            return access_token;
        } catch (error) {
            console.error('Error refreshing token:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getValidAccessToken() {
        try {
            const tokenData = await filePersistence.getOAuthTokens(process.env.ZOHO_USER_EMAIL);
            if (tokenData && tokenData.expires_in > Date.now()) {
                return tokenData.access_token;
            }
            return await this.refreshAccessToken();
        } catch (error) {
            console.error('Error getting valid token:', error.message);
            throw error;
        }
    }
}

module.exports = new ZohoOauthController();