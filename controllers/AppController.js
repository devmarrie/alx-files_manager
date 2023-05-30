const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const AppController = {
  getStatus(req, res) {
    res
      .status(200)
      .json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  },

  async getStat(req, res) {
    const userstt = await dbClient.nbUsers();
    const filestt = await dbClient.nbFiles();
    res.status(200)
      .json({ users: userstt, files: filestt });
  },
};

module.exports = AppController;
