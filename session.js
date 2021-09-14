var EventEmitter = require('events').EventEmitter;
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/cloud-api/yandex/cloud/logging/v1/log_ingestion_service.proto';

class LogService {
    constructor(token, loggingGroupID) {
        var self = this;
        self.events = new EventEmitter;
        self.loggingGroupID = loggingGroupID;

        let packageDefinition = protoLoader.loadSync(
            PROTO_PATH,
            {
                includeDirs: [
                    __dirname + '/cloud-api/',
                    __dirname + '/cloud-api/third_party/googleapis'
                ],
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

        self._metadata = new grpc.Metadata();
        self._metadata.set('authorization', 'Bearer ' + token);

        let logs_proto = grpc.loadPackageDefinition(packageDefinition).yandex.cloud.logging.v1;
        let ssl_creds = grpc.credentials.createSsl();
        self._instance = new logs_proto.LogIngestionService('ingester.logging.yandexcloud.net:443', ssl_creds);
    }

    write(data) {
        return new Promise((resolve, reject) => {
            this._instance.write(data, this._metadata, (res, err) => {
                if (res) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
}

module.exports = LogService;