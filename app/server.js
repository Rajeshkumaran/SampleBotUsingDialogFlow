import express from 'express';
import config from './connectors/config';
import { resolveIntent, getUserDetails } from './utils/helpers';
var bodyParser = require('body-parser');
const { port } = config;
var app = express();
app.use(bodyParser.json({ limit: '256kb' })); // parse application/json

app.get('/', (req, res) => {
  let userContext = getUserDetails(req);
  let salutation = userContext.gender === 'male' ? 'Mr. ' : 'Ms. ';
  res.send('Hello' + salutation + ', ' + userContext.first_name + ' ' + userContext.last_name);
});
global.sessionId = '';

app.post('/fulfillmentResolver', async (req, res) => {
  console.log('url ', req.url, JSON.stringify(req.body));
  sessionId = req.body.session;
  let responseObject = {};
  const queryResult = req.body.queryResult;
  const intentName = queryResult.intent.displayName;
  const params = queryResult.parameters;
  responseObject = await resolveIntent({ intentName, params: '' });
  console.log('responseObject -> to send : ', responseObject);
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
