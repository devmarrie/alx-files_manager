const { MongoClient } = require('mongodb');

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.clientdb = new MongoClient(url, { useUnifiedTopology: true });
    this.clientdb.connect().then(() => {
      this.db = this.clientdb.db(`${DATABASE}`);
    }).catch((err) => {
      console.log(err);
    });
  }

  isAlive() {
    return this.client.isConnected();
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
