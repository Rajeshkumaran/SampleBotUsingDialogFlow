import dbConfig from './config';
import mongodb from 'mongodb';
const mongodbClient = mongodb.MongoClient;
const mongodbConnect = async ()=> {
    return new Promise((resolve,reject)=>{
        mongodbClient.connect(dbConfig.mongoHost, function (err, db) {
            if(err) {
                reject(err);
            }
            if(db){   
                resolve("Connected to mongoDb");
            }
        });           
    });
}
export default mongodbConnect;