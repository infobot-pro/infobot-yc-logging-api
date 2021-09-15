# infobot-yc-logging
Библиотека для записи логов в сервис [Yandex Cloud Logging](https://cloud.yandex.ru/docs/logging/)

Установите пакет через npm:

```sh
npm i infobot-yc-logging
```

## Пример использования
Для работы с Yandex Cloud Logging потребуются следующие данные:
* ID сервисного аккаунта
* Приватный ключ сервисного аккаунта в формате PEM
* ID ключа сервисного аккаунта
* ID группы логирования

Информацию о получении данных сервисных аккаунтов вы найдёте в [документации](https://cloud.yandex.ru/docs/iam/operations/sa/create).

```js
const LoggerAPI = require("infobot-yc-logging");

const YCLogger = new LoggerAPI(
    ID_СЕРВИСНОГО_АККАУНТА, 
    ID_КЛЮЧА_СЕРВИСНОГО_АККАУНТА, 
    ID_ГРУППЫ_ЛОГИРОВАНИЯ, 
    СОДЕРЖИМОЕ_ПРИВАТНОГО_КЛЮЧА);
```
Получения объекта сессии логирования:
```js
 const session = await YCLogger.getLoggerSession();
```

Отправка записи в сервис:
```js
session.write({
    destination: {
        log_group_id: ID_ГРУППЫ_ЛОГИРОВАНИЯ
    },
    resource: {
        type: НАЗВАНИЕ_ПРИЛОЖЕНИЯ
    },
    entries: [
        {
            timestamp: {seconds: Date.parse(info.timestamp) / 1000, nanos: 0},
            level: УРОВЕНЬ_ЛОГИРОВАНИЯ,
            message: ТЕКСТ_ЗАПИСИ,
            json_payload: JSON_PAYLOAD_В_ФОРМАТЕ_google.protobuf.Struct
        }
    ]
});
```
