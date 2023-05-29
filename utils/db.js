const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.clientdb = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });
    this.clientdb.connect().then(() => {
      this.db = this.clientdb.db(`${database}`);
    }).catch((error) => {
      console.log(error);
    });
  }

  isAlive() {
    return this.clientdb.isConnected();
    // try {
    //   await this.clientdb.connect();
    //   this.db = this.clientdb.db();
    //   console.log(`connected to ${this.db}`);
    //   return true;
    // } catch (error) {
    //   console.log(`Failed to connect ${error}`);
    //   return false;
  }

  async nbUsers() {
    const collection = this.db.collection('users');
    const count = await collection.countDocuments();
    return count;
  }

  async nbFiles() {
    const collection = this.db.collection('files');
    const count = await collection.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
