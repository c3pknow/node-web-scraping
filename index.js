const rp = require('request-promise');
const cheerio = require('cheerio');
const Table = require('cli-table');

let users = [];

let table = new Table({
  head: ['userName', '❤️', 'challenges'],
  colWidths: [15, 5, 10],
});

const options = {
  url: `https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received&_=1518604435748`,
  json: true,
  family: 4,
};

rp(options)
  .then(data => {
    let userData = [];

    for (let user of data.directory_items) {
      userData.push({ name: user.user.username, likes_received: user.likes_received });
    }
    process.stdout.write('loading');
    getUserChallengeData(userData);
  })
  .catch(err => {
    console.log(err);
  });

function getUserChallengeData(userData) {
  let i = 0;
  function next() {
    if (i < userData.length) {
      process.stdout.write(`.`);
      let options = {
        url: `https://www.freecodecamp.org/${userData[i].name}`,
        transform: body => cheerio.load(body),
      };

      rp(options)
        .then($ => {
          const fccAccount = $('h1.landing-heading').length == 0;
          const challengesPassed = fccAccount ? $('tbody tr').length : 'unknown';

          table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
          ++i;
          return next();
        })
        .catch(err => console.log(err));
    } else {
      printData();
    }
  }
  return next();
}

function printData() {
  console.log('✅');
  console.log(table.toString());
}
