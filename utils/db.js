const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.clientdb = new MongoClient(url);
  }

  isAlive() {
    this.clientdb.connect();
    return true;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
