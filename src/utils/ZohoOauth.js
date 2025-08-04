const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '../../zcrm_oauthtokens.txt');

const filePersistence = {
    async saveOAuthTokens(tokenObject) {
        return this.updateOAuthTokens(tokenObject);
    },
    async getOAuthTokens(userIdentifier) {
        if (fs.existsSync(tokensPath)) {
            try {
                const tokenData = fs.readFileSync(tokensPath, 'utf8');
                if (!tokenData) return null;
                const tokens = JSON.parse(tokenData);
                return tokens.tokens.find(t => t.user_identifier === userIdentifier) || null;
            } catch (error) {
                console.error('Error parsing token file:', error.message);
                return null;
            }
        }
        return null;
    },
    async updateOAuthTokens(tokenObject) {
        if (!tokenObject.access_token || !tokenObject.refresh_token || !tokenObject.expires_in) {
            throw new Error('Invalid token object: missing required fields');
        }

        const userIdentifier = process.env.ZOHO_USER_EMAIL;
        let tokens = { tokens: [] };
        if (fs.existsSync(tokensPath)) {
            try {
                const tokenData = fs.readFileSync(tokensPath, 'utf8');
                if (tokenData) tokens = JSON.parse(tokenData);
            } catch (error) {
                console.error('Error parsing existing token file, initializing new:', error.message);
            }
        }

        const index = tokens.tokens.findIndex(t => t.user_identifier === userIdentifier);
        if (index !== -1) {
            tokens.tokens[index] = { ...tokens.tokens[index], ...tokenObject };
        } else {
            tokens.tokens.push(tokenObject);
        }

        await fs.promises.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
    }
};

module.exports = filePersistence;