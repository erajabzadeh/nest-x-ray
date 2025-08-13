## Nest X-Ray
[![CI](https://github.com/erajabzadeh/nest-x-ray/actions/workflows/ci.yaml/badge.svg)](https://github.com/erajabzadeh/nest-x-ray/actions/workflows/ci.yaml)

### Project structure
- Modules
  - `RabbitMQModule` provides RabbitMQ functionality through `RabbitMQService`
  - `SignalModule` provides the main x-ray data consumer (`SignalService`) and CRUD operations (`SignalCrudService`)
  - `ProducerModule` provides a cli for generating random data (see the [Producer](#Producer) section below)
- Assumptions
  - Messages might contain data for multiple devices e.g.
    ```
    {
      "device1": {...},
      "device2": {...}
      ...
    }
    ```
  - `(deviceId, time)` tuples are uniqe. If a message for an existing `(deviceId, time)` tuple is received, db values will be replaced with the latest received values.
  - Message are valid according to the pre-defined format. Unprocessable messages (with a missing time value for example) won't be acknowledged or rejected.


### Pre-requisites
- Node.js v22+, npm v10+
- Docker


### Setup (Linux)

1. Clone this respository
  ```bash
  $ git clone git@github.com:erajabzadeh/nest-x-ray.git && cd nest-x-ray
  ```
2. Install the dependencies
  ```bash
  $ npm install --no-save --no-audit
  ```
3. Start the containers
  ```bash
  $ docker compose up -d
  ```
4.  Create a local `.env` file and update the values, if not using the default service settings
  ```bash
  $ cp .env.template .env
  ```


### Main app
To run the main application (queue consumer, api):

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

REST API documentation can be viewed at `http://localhost:3000/docs`.



### Producer
To generate random data messages on the default queue:

```bash
# replace <N> with the number of records you want to generate
$ npm run start:producer <N>
```


### Unit tests

```bash
$ npm run test
```


### Future improvements
- More robust malformed/invalid message handling (retries, dead-lettering, ...)
- Integration/e2e tests
- Error monitoring/alerting
- Healthcheck and metrics endpoints
- Performance monitoring/reporting
