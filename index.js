const jwt = require('jsonwebtoken');
const request = require('request');

const LS = require('./session');

class InfobotYandexCloudLogger {
    constructor(serviceAccountID, keyID, keyData) {
        this.serviceAccountID = serviceAccountID;
        this.keyID = keyID;
        this.keyData = keyData;
        this.token = null;

        if (!this.serviceAccountID) throw new Error('No Service Account ID provided');
        if (!this.keyID) throw new Error('No Service Key ID provided');
        if (!this.keyData) throw new Error('No Key data provided');
    }

    getLoggerSession() {
        return new Promise((resolve, reject) => {
            this.generateToken().then((token) => {
                resolve(new LS(token))
            });
        });
    }

    generateToken() {
        return new Promise((resolve, reject) => {
            if (!(this.token && this.tokenExpire && this.tokenExpire < Math.floor(new Date() / 1000))) {
                const expire = Math.floor(new Date() / 1000) + 60;

                const payload = {
                    'aud': 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    'iss': this.serviceAccountID,
                    'iat': Math.floor(new Date() / 1000),
                    'exp': expire
                };

                const tokenJWT = jwt.sign(payload, this.keyData, {
                    algorithm: 'PS256',
                    keyid: this.keyID
                });

                request.post(
                    'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    {json: {jwt: tokenJWT}},
                    (error, response, body) => {
                        if (!error && parseInt(response.statusCode) === 200) {
                            this.token = body.iamToken;
                            this.tokenExpire = expire;
                            resolve(this.token);
                        } else {
                            reject(error);
                        }
                    }
                );
            } else {
                resolve(this.token);
            }
        });
    }
}

module.exports = InfobotYandexCloudLogger;