import express from 'express';
import config from './connectors/config';
import requestWrapper from './utils/requestWrapper';
import { resolveIntent, get } from './utils/helpers';
import { USER_PROFILE_GRAPH_API_FB_ENDPOINT } from './utils/urls';
import { PAGE_ACCESS_TOKEN } from './utils/credentials';
import responseParser from './utils/responseParser';
var bodyParser = require('body-parser');
const { port } = config;
var app = express();
app.use(bodyParser.json({ limit: '256kb' })); // parse application/json

app.get('/', (req, res) => res.send('Hello'));
global.sessionId = '';
app.post('/fulfillmentResolver', async (req, res) => {
  console.log('url ', req.url);
  sessionId = req.body.session;
  let responseObject = {};
  let senderInfo = get(req, 'body.originalDetectIntentRequest', '');
  if (senderInfo) {
    const source = get(senderInfo, 'source', '');
    const senderId = get(senderInfo, 'payload.data.sender.id');
    // TODO fetch user data from db before inserting into it
    if (senderId) {
      // if senderId is available fetch user data from fb graph api
      const url = USER_PROFILE_GRAPH_API_FB_ENDPOINT.replace(
        'SENDER_ID',
        senderId,
      ).replace('PAGE_ACCESS_TOKEN', PAGE_ACCESS_TOKEN);
      const response = await requestWrapper({
        method: 'get',
        url,
      });
      const data = responseParser(response);
      console.log('user data', data);
      // TODO : need to insert user data into db
    }
  }
  const queryResult = get(req, 'body.queryResult', '');
  const intentName = get(queryResult, 'intent.displayName', '');
  const { parameters } = queryResult;
  responseObject = await resolveIntent({
    intentName,
    parameters,
  });
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
