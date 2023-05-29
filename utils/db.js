const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.clientdb = new MongoClient(url);
    this.db = null;
  }

  isAlive() {
    try {
      this.clientdb.connect();
      this.db = this.clientdb.db();
      return true;
    } catch (error) {
      console.log(`Failed to connect ${error}`);
      return false;
    }
  }

  async nbUsers() {
    try {
      const collection = this.db.collection('users');
      const count = await collection.countDocuments();
      return count;
    } catch (error) {
      console.log(`No documents found ${error}`);
      return -1;
    }
  }

  async nbFiles() {
    const collection = this.db.collection('files');
    const count = await collection.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
