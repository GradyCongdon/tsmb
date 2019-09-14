const MongoClient = require('mongodb').MongoClient;
const mongo_password = process.env.MONGO_PASSWORD;
const url = `mongodb+srv://grady:${mongo_password}@cluster0-f65qf.mongodb.net/test?retryWrites=true&w=majority`;
const dbName = 'tsmb';
const active = false;

async function getPostsCollection() {
  const db = await new MongoClient(url).connect({ db: dbName });
  console.log('Connected successfully to server');
  console.log(db);
  const collection = db.collection('posts');
  return collection;
}
async function getUserPosts(user) {
  const collection = await getPostsCollection();
  const postsArray = await collection
    .find({
      user,
    })
    .toArray();
  const posts = postsArray[0];
  delete posts['_id'];
  return posts;
}

async function saveUserPosts(user) {
  const collection = db.collection('posts');
  const postsArray = await collection.insertMany([body]);
  const posts = postsArray[0];
  // delete posts['_id'];
  return posts;
}

async function init() {
  const collection = await getPostsCollection();
  const result = await collection.insertMany([getPosts()]);
  console.log(result);
  return result;
}

module.exports = {
  active,
  getUserPosts,
  saveUserPosts,
  init,
};
