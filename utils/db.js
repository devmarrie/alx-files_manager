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

  // Files methods
  async createFile(userId, name, type, isPublic, parentId, localPath) {
    const table = this.db.collection('files');
    const newFile = await table.insertOne({
      userId, name, type, isPublic, parentId, localPath,
    });
    return newFile.ops[0];
  }

  async createFolder(userId, name, type, isPublic, parentId) {
    const table = this.db.collection('files');
    const newFolder = await table.insertOne({
      userId, name, type, isPublic, parentId,
    });
    return newFolder.ops[0];
  }

  async fileById(id) {
    const table = this.db.collection('files');
    const fileId = new ObjectID(id);
    const publicFile = await table.findOne({ _id: fileId });
    return publicFile;
  }

  async fileByParentId(parentId) {
    const table = this.db.collection('files');
    const fid = new ObjectID(parentId);
    const file = await table.findOne({ _id: fid });
    return file;
  }

  async fileBasedOnUid(usrId) {
    const table = this.db.collection('files');
    // const uId = new ObjectID(usrId);
    const file = await table.findOne({ userId: usrId });
    return file;
  }

  async ManyBasedOnUid(usId) {
    const table = this.db.collection('files');
    // const uId = new ObjectID(usrId);
    const file = await table.find({ userId: usId }).toArray();
    return file;
  }

  async paginate(pipeline) {
    const table = this.db.collection('files');
    const paged = await table.aggregate(pipeline).toArray();
    return paged;
  }

  async updateFile(usId) {
    const table = this.db.collection('files');
    const userWithFile = await table.findOne({ userId: usId });
    const fId = userWithFile._id;
    const filter = { _id: fId };
    const update = { $set: { isPublic: true } };
    await table.updateOne(filter, update);
    return userWithFile;
  }

  async updateToFalse(usId) {
    const table = this.db.collection('files');
    const userWithFile = await table.findOne({ userId: usId });
    const fId = userWithFile._id;
    const filter = { _id: fId };
    const update = { $set: { isPublic: false } };
    await table.updateOne(filter, update);
    return userWithFile;
  }

  async delFile(name) {
    const table = this.db.collection('files');
    await table.deleteOne({ name });
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
