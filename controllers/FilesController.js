import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const FilesController = {
  async postUpload(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id == null) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, type, data } = req.body;
    const isPublic = req.body.isPublic || false;
    const parentId = req.body.parentId || 0;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
    } else if (!type) {
      res.status(400).json({ error: 'Missing type' });
    } else if (!data && type !== 'folder') {
      res.status(400).json({ error: 'Missing data' });
    }
    if (parentId !== 0) {
      const checkParent = await dbClient.fileByParentId(parentId);
      // res.status(200).json({ checkParent });
      if (!checkParent) {
        res.status(400).json({ error: 'Parent not found' }).end();
      } else if (checkParent.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' }).end();
      } else {
        res.status(200).json({ checkParent });
      }
    }
    if (type === 'folder') {
      const folderToDb = await dbClient.createFolder(id, name, 'folder', isPublic, parentId);
      res.status(201).json({ folderToDb });
    }
    if (type === 'file' || type === 'image') {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${filePath}/${uuidv4()}`;
      const base64String = Buffer.from(data).toString('base64');
      try {
        try {
          await fs.mkdir(filePath);
        } catch (error) {
          // pass. Error raised when file already exists
        }
        await fs.writeFile(fileName, base64String, 'utf-8');
      } catch (error) {
        console.log(error);
      }
      await dbClient.createFile(id, name, type, isPublic, parentId, fileName);
      res.status(201).json({});
    }
  },
};

module.exports = FilesController;
