const { MongoClient, ObjectID } = require('mongodb');
const crypto = require('crypto');

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
    const sha1Hash = crypto.createHash('sha1');
    const hashed = sha1Hash.update(pass).digest('hex');
    const usr = await table.insertOne({ email, password: hashed });
    return usr.ops[0];
  }

  async findUser(mail) {
    const table = this.db.collection('users');
    const found = await table.find({ email: mail }).toArray();
    return found[0];
  }

  async userByid(id) {
    const table = this.db.collection('users');
    // convert user id into an object id
    const userId = new ObjectID(id);
    const found = await table.findOne({ _id: userId });
    return found;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
