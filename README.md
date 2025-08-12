## Nest X-Ray [![CI](https://github.com/erajabzadeh/nest-x-ray/actions/workflows/ci.yaml/badge.svg)](https://github.com/erajabzadeh/nest-x-ray/actions/workflows/ci.yaml)

### Project structure
- Modules
  - `RabbitMQModule` provides RabbitMQ functionality through `RabbitMQService`
  - `SignalModule` provides the main x-ray data consumer (`SignalService`) and x-ray CRUD operations (`SignalCrudService`)
  - `ProducerModule` provides a dummy data producer for generating random x-ray data
- Assumptions
  - X-Ray message records may contain data for multiple devices e.g.
    ```json
    {
      "device1": {...},
      "device2": {...}
      ...
    }
    ```
  - Unprocessable messages will not be acknowledged (and not moved to a DLQ, mainly to keep the implementation simple).
  - `(deviceId, time)` tuples are uniqe. If a message for an existing `(deviceId, time)` tuple is received, db values will be updated with the latest received values.


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
4.  Create a local `.env` file
  ```bash
  $ cp .env.template .env
  ```


### Running the main app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Open `http://localhost:3000/docs` for API documentation.



### Running the producer

```bash
# replace <N> with the number of records you want to generate
$ npm run start:producer <N>
```


### Running the unit tests

```bash
$ npm run test
```
