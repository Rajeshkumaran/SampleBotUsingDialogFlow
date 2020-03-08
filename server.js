import express from 'express';
import mongodbConnect from './connectors/mongoConnection';

var app = express();
app.get('/', (req, res) => res.send('Hello'));
app.get('/updateProfile', (req, res) => {
  console.log('url ', req.url);
});
const server = app.listen(3004, async () => {
  let { address, port } = server.address();
  console.log(`graphql server listening at ${address} on port ${port}`);
  try {
    const mongoConnectionStatus = await mongodbConnect();
    console.log('mongodb status : ', mongoConnectionStatus);
  } catch (err) {
    console.log('mongodb connection err: ', err);
  }
});
