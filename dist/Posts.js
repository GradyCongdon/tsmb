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
      body = await makeUserPosts(user);
    }
  } catch (e) {}
  return body;
}

async function saveUserPostsLocal(user, posts) {
  saved[user] = posts;
  return saved[user];
}

async function makeUserPosts(user) {
  if (mongo.active) {
    return await mongo.init(user);
  } else {
    return initUserPosts(user);
  }
}

function initUserPosts(user) {
  let posts = makePosts();
  posts.posts = posts.posts.map(p => {
    p.text = `${user} ${p.text}`;
    return p;
  });
  return posts;
}

function makePosts() {
  const a = {
    time: Date.now(),
    count: 1,
    text: 'un',
    favorite: false,
  };

  const b = {
    time: Date.now(),
    count: 2,
    text: 'du',
    favorite: false,
  };

  const c = {
    time: Date.now(),
    count: 3,
    text: 'trois',
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
