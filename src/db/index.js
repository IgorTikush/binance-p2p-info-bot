import { dataBaseUri } from '../../config/index.js';
import { MongoClient } from 'mongodb';

export let db;

(async () => {
  const client = new MongoClient(dataBaseUri);
  await client.connect().then(() => console.log('db connected')).catch(console.log);
  db = client.db('p2p-info');
})();
