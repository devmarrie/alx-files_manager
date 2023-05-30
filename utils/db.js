const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    // conncetion url
    const url = `mongodb://${host}:${port}/${database}`;
    this.clientdb = new MongoClient(url, { useUnifiedTopology: true });
    this.status = false;
  }

  async conn() {
    try {
      await this.clientdb.connect();
      this.status = true;
      console.log('connected to mongodb');
    } catch (error) {
      console.log(`Error ${error}`);
    }
  }

  isAlive() {
    return this.status;
    // try {
    //   await this.clientdb.connect();
    //   this.db = this.clientdb.db();
    //   console.log(`connected to ${this.db}`);
    //   return true;
    // } catch (error) {
    //   console.log(`Failed to connect ${error}`);
    //   return false;
  }

  // async nbUsers() {
  //   const collection = this.db.collection('users');
  //   const count = await collection.countDocuments();
  //   return count;
  // }

  // async nbFiles() {
  //   const collection = this.db.collection('files');
  //   const count = await collection.countDocuments();
  //   return count;
  // }
}

const dbClient = new DBClient();
dbClient.isAlive();
module.exports = dbClient;
