import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
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
    }
    if (!type) {
      res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const checkParent = await dbClient.fileByParentId(parentId);
      if (!checkParent) {
        res.status(400).json({ error: 'Parent not found' }).end();
      } else if (checkParent.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' }).end();
      } else {
        const pId = checkParent._id;
        const folderToDb = await dbClient.createFolder(id, name, 'folder', isPublic, pId);
        res.status(201).json(folderToDb);
      }
    } else {
      const folderToDb = await dbClient.createFolder(id, name, 'folder', isPublic, parentId);
      res.status(201).json(folderToDb);
    }
    if (type === 'file' || type === 'image') {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${filePath}/${uuidv4()}`;
      const base64String = Buffer.from(data).toString('base64');
      console.log(`base64String ${base64String}`);
      try {
        try {
          await fs.mkdir(filePath);
        } catch (error) {
          // pass. Error raised when file already exists
        }
        await fs.writeFile(fileName, data, 'utf-8');
      } catch (error) {
        console.log(error);
      }
      const dataFinal = await dbClient.createFile(id, name, type, isPublic, parentId, fileName);
      res.status(201).json(dataFinal);
    }
  },
  async getShow(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const redisId = await redisClient.get(key);
    if (redisId == null) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const fechtFile = await dbClient.fileBasedOnUid(redisId);
    if (fechtFile) {
      res.status(201).json(fechtFile);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  },
  async getIndex(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id == null) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const page = parseInt(req.query.page, 10) || 0;
    const parentId = parseInt(req.query.parentId, 10) || 0;
    const PAGE_SIZE = 20;

    const pipeline = [
      { $match: { parentId } }, // Match documents based on parentId (if applicable)
      { $sort: { _id: 1 } }, // Sort by any field (in this case, _id) for consistent results
      { $skip: page * PAGE_SIZE }, // Skip documents based on page number
      { $limit: PAGE_SIZE }, // Limit the number of documents per page
    ];
    const userFiles = await dbClient.paginate(pipeline);
    res.status(201).json(userFiles);
  },
  async putPublish(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id == null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const userFile = await dbClient.updateFile(id);
      if (!userFile) {
        res.status(401).json({ error: 'Not found' });
      } else {
        res.status(201).json(userFile);
      }
    }
  },
  async putUnpublish(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id == null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const userFile = await dbClient.updateToFalse (id);
      if (!userFile) {
        res.status(401).json({ error: 'Not found' });
      } else {
        res.status(201).json(userFile);
      }
    }
  },

  async getFile(req, res) {
    const { id } = req.params;
    const doc = dbClient.fileById(id);
    if (!doc) {
      res.status(404).json({ error: 'Not found' });
    }
    if (!doc.isPublic === false && !doc.parentId) {
      res.status(404).json({ error: 'Not found' });
    }
    if (doc.type === 'folder') {
      res.status(404).json({ error: 'A folder doesnt have content' });
    }
    if (!doc.localPath) {
      res.status(404).json({ error: 'Not found' });
    }
    const contentType = mime.contentType(doc.name);
    return res.header('Content-Type', contentType).status(200).sendFile(doc);
  },
};

module.exports = FilesController;
