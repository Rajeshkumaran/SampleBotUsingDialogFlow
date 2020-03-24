import express from 'express';
import config from './connectors/config';
import resolveIntent from './intentResolvers';
import { sendEmail } from './utils/helpers';
var bodyParser = require('body-parser');
const { port } = config;
var app = express();
app.use(bodyParser.json({ limit: '256kb' })); // parse application/json

app.get('/', async (req, res) => {
  await sendEmail();
  res.send('hello');
});

global.sessionId = '';

app.post('/fulfillmentResolver', async (req, res) => {
  const startTime = new Date().getTime();
  console.log('url ', req.url, req.body);
  sessionId = req.body.session;
  let responseObject = {};
  const queryResult = req.body.queryResult;
  const intentName = queryResult.intent.displayName;
  const { parameters } = queryResult;
  responseObject = await resolveIntent({
    intentName,
    parameters,
    request: req,
  });
  const endTime = new Date().getTime();
  const processingTime = (endTime - startTime) / 1000;
  console.log('responseObject -> to send : ', JSON.stringify(responseObject));
  console.log('processingTime for this request -> ', processingTime);
  res.send(responseObject);
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  try {
    // const mongoConnectionStatus = await mongodbConnect();
    // console.log('mongodb status : ', mongoConnectionStatus);
  } catch (err) {
    // console.log('mongodb connection err: ', err);
  }
});
process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
  });
