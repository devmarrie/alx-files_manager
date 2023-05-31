import { v4 as uuidv4 } from 'uuid';

const crypto = require('crypto');
const dbUser = require('../utils/db');
const redisClient = require('../utils/redis');

const AuthController = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    const credentials = authHeader.replace('Basic', '').trim();
    console.log(credentials);
    // decode from base64
    const decodeCred = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodeCred.split(':');

    const user = await dbUser.findUser(email);
    const hashPass = crypto.createHash('sha1').update(password).digest('hex');
    if (!user || user.password !== hashPass) {
      console.error('Unauthorised');
    } else {
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
      res.status(200).json({ token });
    }
  },

  async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      res.status(204).json({});
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

};

module.exports = AuthController;
