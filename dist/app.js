const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-body');
const serve = require('koa-static-server');

const Posts = require('./Posts.js');

const app = new koa();
const router = new koaRouter();

app.use(router.routes()).use(router.allowedMethods());
app.use(serve({ rootDir: 'static' }));
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.listen(3000);
console.log('on port 3k');

router.get('/', async ctx => {
  const user = ctx.params.user;
  if (!user) throw new Error('no user');
  ctx.body = await Posts.getUserPosts(user);
});

router.get('/user/:user', async ctx => {
  const user = ctx.params.user;
  if (!user) throw new Error('no user');
  ctx.body = await Posts.getUserPosts(user);
});

router.post('/user/:user', koaBody(), async ctx => {
  const user = ctx.params.user;
  if (!user) throw new Error('no user');
  const posts = ctx.request.body;
  ctx.body = await Posts.saveUserPosts(user, posts);
});

router.get('/tsmb-init', async ctx => {
  ctx.body = await Posts.initUserPosts();
});
