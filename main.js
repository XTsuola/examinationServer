const Koa = require("koa");
const Router = require("koa-router");
const requireDirectory = require("require-directory");
// const fs = require('fs');
const app = new Koa();
const cors = require("koa-cors")
const koaBody = require('koa-body');
app.use(koaBody({multipart: true,}));//解析post以及form-data传参
app.use(cors())

requireDirectory(module, "./router/routes", {
  visit: (router) => {
    if (router instanceof Router) {
      app.use(router.routes());
    }
  }
});

app.use(require('koa-static')(__dirname + '/public'))
app.listen(7147);