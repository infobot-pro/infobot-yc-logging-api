const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/cloud-api/yandex/cloud/logging/v1/log_ingestion_service.proto';

class LogService {
    constructor(token) {
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

        this._metadata = new grpc.Metadata();
        this._metadata.set('authorization', 'Bearer ' + token);

        const logs_proto = grpc.loadPackageDefinition(packageDefinition).yandex.cloud.logging.v1;
        const ssl_creds = grpc.credentials.createSsl();
        this._instance = new logs_proto.LogIngestionService('ingester.logging.yandexcloud.net:443', ssl_creds);
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