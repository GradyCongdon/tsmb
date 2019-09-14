const mongo = require('./mongo.js');

async function getUserPosts(user) {
  if (mongo.active) {
    return mongo.getUserPosts(user);
  } else {
    return getUserPostsLocal(user);
  }
}

async function saveUserPosts(user, posts) {
  if (mongo.active) {
    return saveUserPosts(user, posts);
  } else {
    return saveUserPostsLocal(user, posts);
  }
}

let saved = {};
async function getUserPostsLocal(user) {
  try {
    body = saved[user];
    if (!body) {
      body = getPosts();
    }
  } catch (e) {}
  return body;
}

async function saveUserPostsLocal(user, posts) {
  saved[user] = posts;
  return saved[user];
}

function makeUserPosts(user) {
  if (mongo.active) {
    return mongo.init();
  } else {
    return init();
  }
}

function initUserPosts() {
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
