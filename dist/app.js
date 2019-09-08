const koa = require('koa');
const koaRouter = require('koa-router');
const app = new koa();
const router = new koaRouter();
//const bodyParser = require('body-parser');
const serve = require('koa-static-server');

app.use(router.routes()).use(router.allowedMethods());
app.use(serve({ rootDir: 'static' }));

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongo_password = process.env.MONGO_PASSWORD;
const url = `mongodb+srv://grady:${mongo_password}@cluster0-f65qf.mongodb.net/test?retryWrites=true&w=majority`;
const dbName = 'tsmb';
const client = new MongoClient(url);

let db;
client.connect(function(err) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db = client.db(dbName);
});

app.listen(3000);
console.log('on port 3k');

router.get('/tsmb-init', async ctx => {
  const collection = db.collection('posts');
  const result = await collection.insertMany([getPosts()]);
  console.log(result);
  ctx.body = result;
});

router.get('/api', async ctx => {
  const collection = db.collection('posts');
  const postsArray = await collection.find({}).toArray();
  const posts = postsArray[0];
  delete posts['_id'];
  ctx.body = posts;
});

router.get('/fake', async ctx => {
  ctx.body = getPosts();
});

router.get('/hi', async ctx => {
  ctx.body = {
    message: 'hello',
  };
});

function getPosts() {
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
