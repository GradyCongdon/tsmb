const koa = require('koa');
const koaRouter = require('koa-router');
const app = new koa();
const router = new koaRouter();
//const bodyParser = require('body-parser');
const serve = require('koa-static-server');

app.use(router.routes()).use(router.allowedMethods());
app.use(serve({ rootDir: 'static' }));

app.listen(3000);
console.log('on port 3k');

router.get('/api', async ctx => {
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
  ctx.body = {
    posts: [a, b, c],
  };
});

router.get('/hi', async ctx => {
  ctx.body = {
    message: 'hello',
  };
});
