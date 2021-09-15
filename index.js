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
            if (!(self.token && self.tokenExpire && self.tokenExpire < Math.floor(new Date() / 1000))) {
                const expire = Math.floor(new Date() / 1000) + 60;

                const payload = {
                    'aud': 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    'iss': self.serviceAccountID,
                    'iat': Math.floor(new Date() / 1000),
                    'exp': expire
                };

                const tokenJWT = jwt.sign(payload, self.keyData, {
                    algorithm: 'PS256',
                    keyid: self.keyID
                });

                request.post(
                    'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    {json: {jwt: tokenJWT}},
                    function (error, response, body) {
                        if (!error && parseInt(response.statusCode) === 200) {
                            self.token = body.iamToken;
                            self.tokenExpire = expire;
                            resolve(self.token);
                        } else {
                            reject(error);
                        }
                    }
                );
            } else {
                resolve(self.token);
            }
        });
    }
}

module.exports = InfobotYandexCloudLogger;