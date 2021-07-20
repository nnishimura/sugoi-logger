# sugoi-logger

📝 Javascript logging module with support for syslog [RFC5424](https://tools.ietf.org/html/rfc5424) and json log format.

## Features
- Supports syslog and JSON logging format. 
- Custom format is also supported with `options.formatter`
- Adds an unique `requestId` to log messages. Can be used with express APIs.
- Adds info about line number and filename to log messages.
- Logging levels: {`emergency`|`alert`|`critical`|`error`|`warning`|`notice`|`info`|`debug`}
- Supports custom `transports`. By default it prints messages as `stdout`/`stderr`

## Installation

```
npm install sugoi-logger --save
```

## Usage

Set `LOGGING_TYPE` env variable to set logType.
Logtype defaults to `SYSLOG` if not set.

```
export LOGGING_TYPE=JSON
```

Create your own logger and export it:

```js
// main.js
import { Logger, setRequestId } from 'logging';

// create logger instance 
export const logger = new Logger({
    application: 'my-application' // custom application name
});

// Use setRequestId function to persist messageId in CLS within the callback function. Logger will pick up the context from this.
// example as express middleware
app.use((_req, _res, next) => setRequestId(next));

// example with other functions
function doSomething() {
   setRequestId(() => {
      doingSomething();
   })
}

// example with custom messageId
app.use((req, _res, next) => setRequestId(next, req.headers.messageId));

```

Use the logger instance:

```js
// routes/list.js
import { logger } from './main';
import { v4 as uuidv4 } from 'uuid';

function getList () {
    // log the message. by default it will format messages into syslog RFC5424 and prints it in stdout
    logger.info('log message');

    // usage with structured data (can be set in data field)
    logger.error('log message', { meta: { user: { id: '1234' } } });
}
```

## Options

Syntax

```js
logger.info('log message', { key: value })
```

| key        | value                                                                  | note                                                                                                       |
|------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| data       | {     [ sdId :   string ] :   Record < string   \|   number ,  any > } | additional properties for this logger. If LOGGING_TYPE is syslog, this will be printed as structured data. |
| context    | { [key:string]: any }                                                  | context of this log message in key-value format. Can be used in custom `formatter`                         |
| transports | (( arg :   FormatterOptions )   =>   void)[]                           | set of logging transport functions                                                                         |
| formatter  | ( arg :   FormatterOptions )   =>   string                             | formatter function for log message                                                                         |

## Sample logs

### type: syslog (RFC5424)

```
<187>1 2020-12-21T02:29:50.230Z pinpoint-adaptor-57b8b78b47-66jqj application 73222 dfe6efb3-1dcf-42f5-a82a-f8e86852f922 - src/sugoiCode.ts:30 log message
```

### type: JSON

```json
{
   "application":"node",
   "hostname":"sugoiMachine",
   "level":"Error",
   "requestId":"0514cf2c-d5b4-4289-9f7c-ea7ced1a1779",
   "message":"log message",
   "pid":74955,
   "thread":74955,
   "time":"2020-12-24T08:25:06.487Z",
   "data":{
      "traffic":{
         "counter":100,
         "ip":"192.0.2.0"
      },
      "user":{
         "userId":123
      }
   },
   "file": "src/sugoiCode.ts",
   "lineNumber": 30
}
```