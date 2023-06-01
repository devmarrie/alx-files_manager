import dbClient from './utils/db';

const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 10) {
          reject();
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });
};

(async () => {
  console.log(dbClient.isAlive());
  await waitConnection();
  console.log(dbClient.isAlive());
  console.log(await dbClient.nbUsers());
  console.log(await dbClient.nbFiles());
  // console.log(await dbClient.newUser('kenny@gmail.com', 'ken321'));
  console.log(await dbClient.findUser('john@doe.com'));
  console.log(await dbClient.userByid('6477052496fe7a4a7a8189b6'));
  // console.log(await dbClient.delFile('python.txt'));
  // console.log(await dbClient.createFile('6477052496fe7a4a7a8189b6', 'c++.txt', 'file', true, 0, '/tmp/files_manager'));
  // const base64String = Buffer.from('kenny@gmail.com:ken321').toString('base64');
  // console.log(base64String);
  // console.log(await dbClient.fileById('6477a1631de1715315089819'));
  console.log(await dbClient.fileBasedOnUid('6477052184d2084a4a087dbe'));
  // console.log(await dbClient.updateFile('64778b784a9efe1954551d76,'));
//   const pipeline = [
//     { $sort: { parentId: 1 } },
//     { $skip: 1 * 20 },
//     { $limit: 20 },
//   ];
//   console.log(await dbClient.paginate(pipeline));
})();
// a2VubnlAZ21haWwuY29tOmtlbjMyMQ==
// e10ea04f-04a3-4266-b7e8-198d95775177
