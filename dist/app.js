const koa = require('koa');
const koaRouter = require('koa-router');
const app = new koa();
const router = new koaRouter();
const koaBody = require('koa-body');
const serve = require('koa-static-server');

app.use(router.routes()).use(router.allowedMethods());
app.use(serve({ rootDir: 'static' }));
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

const MongoClient = require('mongodb').MongoClient;
const mongo_password = process.env.MONGO_PASSWORD;
const url = `mongodb+srv://grady:${mongo_password}@cluster0-f65qf.mongodb.net/test?retryWrites=true&w=majority`;
const dbName = 'tsmb';

app.listen(3000);
console.log('on port 3k');

async function getPostsCollection() {
  const db = await new MongoClient(url).connect({ db: dbName });
  console.log('Connected successfully to server');
  console.log(db);
  const collection = db.collection('posts');
  return collection;
}

router.get('/tsmb-init', async ctx => {
  const collection = await getPostsCollection();
  const result = await collection.insertMany([getPosts()]);
  console.log(result);
  ctx.body = result;
});

router.get('/api', async ctx => {
  const collection = await getPostsCollection();
  const postsArray = await collection.find({}).toArray();
  const posts = postsArray[0];
  delete posts['_id'];
  ctx.body = posts;
});

let saved = {};
router.get('/user/:user', async ctx => {
  let user;
  let body;
  try {
    user = ctx.params.user;
    body = saved[user];
    if (!body) {
      body = getPosts();
    }
  } catch (e) {
    if (!user) throw new Error('no user');
  }
  ctx.body = body;
});

router.post('/user/:user', koaBody(), async ctx => {
  let user;
  try {
    user = ctx.params.user;
    saved[user] = ctx.request.body;
  } catch (e) {
    if (!user) throw new Error('no user');
  }
  ctx.body = saved[user];
});

/*
router.get('/user/:id', async ctx => {
  const user = ctx.request.params.user;
  if (!user) throw new Error('no user');

  const collection = await getPostsCollection();
  const postsArray = await collection
    .find({
      user,
    })
    .toArray();
  const posts = postsArray[0];
  delete posts['_id'];
  ctx.body = posts;
});

router.post('/user/:id/', async ctx => {
  const body = ctx.request.body;
  const user = ctx.request.params.user;
  if (!user) throw new Error('no user');
  body.user = user;

  const collection = db.collection('posts');
  const postsArray = await collection.insertMany([body]);
  const posts = postsArray[0];
  // delete posts['_id'];
  ctx.body = posts;
});
*/

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

function getUserPosts(user) {
  let posts = getPosts();
  posts.posts = posts.posts.map(p => {
    p.text = `${user} ${p.text}`;
    return p;
  });
  return posts;
}
