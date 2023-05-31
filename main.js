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
  const base64String = Buffer.from('kenny@gmail.com:ken321').toString('base64');
  console.log(base64String);
})();
