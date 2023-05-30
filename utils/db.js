const { MongoClient } = require('mongodb');

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(`${DATABASE}`);
    }).catch((err) => {
      console.log(err);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const coll = this.db.collection('users');
    const usersCount = await coll.countDocuments();
    return usersCount;
  }

  async nbFiles() {
    const fcol = this.db.collection('files');
    const filesCount = await fcol.countDocuments();
    return filesCount;
  }

  async newUser(email, pass) {
    const table = this.db.collection('users');
    const usr = await table.insertOne({ email, pass });
    return usr.ops[0];
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
