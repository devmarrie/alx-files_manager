const dbUser = require('../utils/db');
const redisClient = require('../utils/redis');

const UsersController = {
  async postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
    }
    try {
      const isExist = await dbUser.findUser(email);
      if (isExist) {
        res.status(400).json({ error: 'Already exist' });
      } else {
        const newUsr = await dbUser.newUser(email, password);
        res.status(201).json({ id: newUsr._id, email });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id == null) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const stringify = id.toString();
    const user = await dbUser.userByid(stringify);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.status(200).json({ id: user._id, email: user.email });
    }
  },
};

module.exports = UsersController;
