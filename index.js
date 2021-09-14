var jwt = require('jsonwebtoken');
var request = require('request');

var LS = require('./session');

class InfobotYandexCloudLogger {
    constructor(serviceAccountID, keyID, loggingGroupID, keyData) {
        this.serviceAccountID = serviceAccountID;
        this.keyID = keyID;
        this.keyData = keyData;
        this.loggingGroupID = loggingGroupID;
        this.token = null;

        if (!this.serviceAccountID) throw new Error('No Service Account ID provided');
        if (!this.keyID) throw new Error('No Service Key ID provided');
        if (!this.keyData) throw new Error('No Key data provided');
        if (!this.loggingGroupID) throw new Error('No Logging Group ID provided');
    }

    getLoggerSession() {
        var self = this;
        return new Promise((resolve, reject) => {
            this.generateToken().then((token) => {
                resolve(new LS(token, self.loggingGroupID))
            });
        });
    }

    generateToken() {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (!(self.token && self.tokenExpire && self.tokenExpire < Math.floor(new Date() / 1000))) {
                var expire = Math.floor(new Date() / 1000) + 60;

                var payload = {
                    'aud': 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    'iss': self.serviceAccountID,
                    'iat': Math.floor(new Date() / 1000),
                    'exp': expire
                };

                var tokenJWT = jwt.sign(payload, self.keyData, {
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