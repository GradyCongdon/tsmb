const mongo = require('./mongo.js');

async function getUserPosts(user) {
  let posts;
  let from;
  if (mongo.active) {
    from = 'mongo';
    posts = await mongo.getUserPosts(user);
  } else {
    from = 'local';
    posts = await getUserPostsLocal(user);
  }
  console.log(from, posts);
  return posts;
}

async function saveUserPosts(user, posts) {
  let from;
  if (mongo.active) {
    from = 'mongo';
    posts = await saveUserPosts(user, posts);
  } else {
    from = 'local';
    posts = await saveUserPostsLocal(user, posts);
  }
  console.log(from);
  return posts;
}

let saved = {};
async function getUserPostsLocal(user) {
  try {
    body = saved[user];
    if (!body) {
      body = makeKoanPosts(user);
    }
  } catch (e) {}
  return body;
}

async function saveUserPostsLocal(user, posts) {
  saved[user] = posts;
  return saved[user];
}

async function initUserPosts(user) {
  if (mongo.active) {
    return await mongo.init(user);
  } else {
    return makeKoanPosts();
  }
}

function buildKoans() {
  const koans = [
    'What is your original face before you were born?',
    'When you can do nothing, what can you do?',
    'If you call this a short staff, you oppose its reality. If you do not call it a short staff, you ignore the fact. Now what do you wish to call this?',
    'A broken mirror never reflects again; fallen flowers never go back to the old branches',
    'The world is vast and wide. Why do you put on your robes at the sound of a bell?',
    'Out of nowhere, the mind comes forth',
    'To conceive of ourselves as fragmentary matter cohering for a millisecond between two eternities of darkness is very difficult',
  ];
  let start = Math.floor(Math.random() * (koans.length - 1));
  return function() {
    i = start % (koans.length - 1);
    start = start + 1;
    return koans[i];
  };
}

function makeKoanPosts() {
  const getKoan = buildKoans();
  const a = {
    time: Date.now(),
    count: 1,
    text: getKoan(),
    favorite: false,
  };

  const b = {
    time: Date.now(),
    count: 2,
    text: getKoan(),
    favorite: false,
  };

  const c = {
    time: Date.now(),
    count: 3,
    text: getKoan(),
    favorite: false,
  };
  return {
    posts: [a, b, c],
  };
}

module.exports = {
  saveUserPosts,
  getUserPosts,
  initUserPosts,
};
