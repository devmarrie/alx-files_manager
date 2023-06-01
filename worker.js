import { promises as fs } from 'fs';

const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

async function thumbNail(width, localPath) {
  const thumbnail = await imageThumbnail(localPath, { width });
  return thumbnail;
}

fileQueue.process(async (job, done) => {
  console.log('Processing...');
  const { fileId } = job.data;
  const { userId } = job.data;
  job.progress(42);

  if (!fileId) {
    done(new Error('Missing fileId'));
  }

  if (!userId) {
    done(new Error('Missing userId'));
  }

  if (!userId && !fileId) {
    done(new Error('File not found'));
  }

  const file = await dbClient.fileBasedOnUid(userId);
  const filepath = file.localPath;
  console.log(filepath);

  const fileName = file.localPath;
  const thumbnail500 = await thumbNail(500, fileName);
  const thumbnail250 = await thumbNail(250, fileName);
  const thumbnail100 = await thumbNail(100, fileName);

  console.log('Writing files to system');
  const image500 = `${file.localPath}_500`;
  const image250 = `${file.localPath}_250`;
  const image100 = `${file.localPath}_100`;

  await fs.writeFile(image500, thumbnail500);
  await fs.writeFile(image250, thumbnail250);
  await fs.writeFile(image100, thumbnail100);
  done();
});
