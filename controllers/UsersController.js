const dbUser = require('../utils/db');

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
};

module.exports = UsersController;
