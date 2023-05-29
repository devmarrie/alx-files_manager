const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(req, res) {
    res
      .status(200)
      .json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStat(req, res) {
    const userstt = await dbClient.nbUsers();
    const filestt = await dbClient.nbFiles();
    res.status(200)
      .json({ users: userstt, files: filestt});
  }
}
module.exports = AppController;
