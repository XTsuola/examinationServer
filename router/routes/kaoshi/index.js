const router = require("../../index")
const path = require("path")
const { queryAll, querySome, queryOne, update, add, findLast, deleteData, zuhequery } = require('../../../mongodb')
const fs = require("fs")
const { changeTime, getStarScore } = require("../../utils")
const { ObjectId } = require("mongodb")

// 登录
router.post("/login", async (ctx, next) => {
    const req = ctx.request.body
    const sql = { "account": req.account }
    const data = await queryOne(sql, 'user')
    if (data) {
        if (req.password == data.password) {
            ctx.body = {
                "code": 200,
                "data": data,
                "msg": '登录成功'
            }
        } else {
            ctx.body = {
                "code": 0,
                "msg": '密码错误'
            }
        }
    } else {
        ctx.body = {
            "code": 0,
            "msg": '账号不存在'
        }
    }
})

// 获取题库
router.get("/getList", async (ctx, next) => {
    const sql = {}
    const data = await queryAll(sql, 'subject')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 获取当前试卷题目
router.get("/getPaper", async (ctx, next) => {
    const sql1 = { "id": parseInt(ctx.query.id) }
    const data = await queryOne(sql1, 'paper')
    let arr = []
    for (var i = 0; i < data.stemArr.length; i++) {
        const sql2 = { "id": data.stemArr[i] }
        const data2 = await queryOne(sql2, 'subject')
        arr.push(data2)
    }
    ctx.body = {
        "code": 200,
        "paperName": data.paperName,
        "rows": arr,
        "msg": '查询成功'
    }
})

// 获取分数
router.post("/getScore", async (ctx, next) => {
    const req = ctx.request.body
    const sql = { paperId: parseInt(req.paperId), userId: parseInt(req.userId) }
    const res = await queryOne(sql, 'report')
    let arr = []
    const anwserArr = res.anwserArr
    const rightArr = res.rightArr
    const remarkArr = res.remarkArr
    for (var i = 0; i < anwserArr.length; i++) {
        if (anwserArr[i] == rightArr[i]) {
            arr.push(remarkArr[i] + " (你回答对啦！)")
        } else {
            arr.push(remarkArr[i] + " (你回答错啦！)")
        }
    }
    let score = res.score
    /* dataArr.forEach(item => {
        const index = data.findIndex(e => e.id === item.id)
        rightArr.push(data[index].anwser)
        if (index != -1 && item.anwser === data[index].anwser || data[index].anwser == " ") {
            arr.push(data[index].remark + " (你答对啦！)")
        } else {
            arr.push(data[index].remark + " (你答错了！)")
        }
    }); */
    ctx.body = { arr: arr, score: Math.round(score), anwserArr: anwserArr, rightArr: rightArr }
    // fs.appendFile('./write.log', changeTime(new Date()) + ":" + JSON.stringify(dataArr) + "\n", function (err) {
    //     if (err) {
    //         throw err;
    //     }
    // })
})

// 新增考卷
router.post("/addUserPaper", async (ctx, next) => {
    const req = ctx.request.body
    const sql1 = { "id": req.paperId }
    const res = await queryOne(sql1, 'paper')
    const paperName = res.paperName
    const dataArr = res.stemArr
    let arr = []
    let rightArr = []
    let remarkArr = []
    for (var i = 0; i < dataArr.length; i++) {
        arr.push({ id: dataArr[i] })
    }
    const sql2 = { $or: arr }
    const result = await queryAll(sql2, 'subject')
    dataArr.forEach(item => {
        const index = result.findIndex(e => e.id === item)
        rightArr.push(result[index].anwser)
        remarkArr.push(result[index].remark)
    });
    const params = { userId: parseInt(req.userId), paperId: parseInt(req.paperId), paperName: paperName, anwserArr: [], rightArr: rightArr, score: "", remarkArr: remarkArr, flag: true }
    const data = await add(params, 'report')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '新增成功'
    }
})

// 修改考卷
router.post("/updateUserPaper", async (ctx, next) => {
    const req = ctx.request.body
    const dataArr = JSON.parse(req.dataArr)
    let anwserArr = []
    let rightArr = []
    for (var i = 0; i < dataArr.length; i++) {
        anwserArr.push(dataArr[i].anwser.toString())
    }
    const sql = { paperId: parseInt(req.paperId), userId: parseInt(req.userId) }
    const res = await queryOne(sql, 'report')
    rightArr = res.rightArr
    let score = 0
    for (var i = 0; i < anwserArr.length; i++) {
        if (rightArr[i] === "5.8,6,6.2,6.6,7,7.5,8,9,15,20") {
            let list = rightArr[i].split(",")
            score = score + parseFloat(getStarScore(list, anwserArr[i]))
        } else {
            if (anwserArr[i] == rightArr[i]) {
                score++
            }
        }
    }
    score *= (100 / anwserArr.length)
    const param1 = { paperId: parseInt(req.paperId), userId: parseInt(req.userId) }
    const param2 = { anwserArr: anwserArr, score: Math.round(score).toString(), flag: false }
    const data = await update(param1, param2, 'report')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '新增成功'
    }
})

// 获取所有试卷
router.get("/paperList", async (ctx, next) => {
    const sql = {}
    const data = await queryAll(sql, 'paper')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 修改试卷
router.post("/updatePaper", async (ctx, next) => {
    const req = ctx.request.body
    const param1 = { id: req.id }
    const param2 = { stemArr: req.arr, paperName: req.paperName }
    const data1 = await update(param1, param2, 'paper')
    const param3 = { paperId: req.id }
    const param4 = { paperName: req.paperName }
    const data2 = await update(param3, param4, 'report')
    ctx.body = {
        "code": 200,
        "rows": data1,
        "msg": '修改成功'
    }
})

// 新增试卷
router.post("/addPaper", async (ctx, next) => {
    const req = ctx.request.body
    const lastInfo = await findLast('paper')
    let index = 0
    if (lastInfo.length) {
        index = lastInfo[0].id
    }
    const params = { id: index + 1, stemArr: req.arr, paperName: req.paperName }
    const data = await add(params, 'paper')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '新增成功'
    }
})

// 删除试卷
router.get("/deletePaper", async (ctx, next) => {
    const sql = { id: parseInt(ctx.query.id) }
    const data = await deleteData(sql, 'paper')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '删除成功'
    }
})

// 获取试卷下拉框
router.get("/getPaperName", async (ctx, next) => {
    const sql = {}
    let obj = { id: 1, paperName: 1, _id: 0 }
    const data = await querySome(sql, obj, 'paper')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 获取指定用户试卷
router.get("/getPaperName", async (ctx, next) => {
    const sql = {}
    let obj = { id: 1, paperName: 1, _id: 0 }
    const data = await querySome(sql, obj, 'paper')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 新增题库试题
router.post("/addSubject", async (ctx, next) => {
    const req = ctx.request.body
    const lastInfo = await findLast('subject')
    let index = 0
    if (lastInfo.length) {
        index = lastInfo[0].id
    }
    const params = { id: index + 1, url: req.url, stem: req.stem, type: req.type, selectArr: req.selectArr, anwser: req.anwser, remark: req.remark }
    const data = await add(params, 'subject')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '新增成功'
    }
})

// 查询用户信息
router.get("/getUserInfo", async (ctx, next) => {
    const sql = { "_id": new ObjectId(ctx.query._id) }
    const data = await queryOne(sql, 'user')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 获取用户试卷
router.get("/getUserPaper", async (ctx, next) => {
    const sql = { userId: parseInt(ctx.query.userId) }
    let obj = { anwserArr: 0, rightArr: 0 }
    const data = await querySome(sql, obj, 'report')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 查询所有用户关联的试卷
router.get("/getStudentsPaper", async (ctx, next) => {
    const sql1 = {}
    const data = await queryAll(sql1, 'user')
    for (var i = 0; i <= data.length - 1; i++) {
        const sql2 = { userId: data[i].id }
        const obj = { paperId: 1, paperName: 1, score: 1, _id: 0 }
        const res = await querySome(sql2, obj, 'report')
        data[i].paperList = res
    }
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 查询剩余考卷
router.post("/getOtherPaper", async (ctx, next) => {
    const req = ctx.request.body
    const dataArr = req.dataArr
    let arr = []
    let sql = {}
    if (dataArr.length) {
        for (var i = 0; i < dataArr.length; i++) {
            arr.push({ id: { $ne: dataArr[i] } })
        }
        sql = { $and: arr }
    } else {
        sql = {}
    }
    const data = await queryAll(sql, 'paper')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '查询成功'
    }
})

// 新增考生
router.post("/addStudent", async (ctx, next) => {
    const req = ctx.request.body
    const lastInfo = await findLast('user')
    let index = 0
    if (lastInfo.length) {
        index = lastInfo[0].id
    }
    const params = { id: index + 1, account: req.account, password: req.password, name: req.name, age: req.age, phone: req.phone, remark: req.remark }
    const data = await add(params, 'user')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '新增成功'
    }
})

// 修改考生
router.post("/updateStudent", async (ctx, next) => {
    const req = ctx.request.body
    const param1 = { id: req.id }
    const param2 = { account: req.account, password: req.password, name: req.name, age: parseInt(req.age), phone: req.phone, remark: req.remark }
    const data = await update(param1, param2, 'user')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '修改成功'
    }
})

// 修改头像
router.post("/updateImg", async (ctx, next) => {
    const req = ctx.request.body
    const sql = { "id": req.id }
    const res = await queryOne(sql, 'user')
    const baseName = res.img
    if (baseName) {
        fs.unlink(('./public/img/' + baseName), function (err) {
            if (err) {
                return false
            }
        })
    }
    const imgName = req.id + 'touxiang' + Date.now() + '.jpg'
    const path = './public/img/' + imgName
    const base64 = req.img.replace(/^data:image\/\w+;base64,/, "")
    const dataBuffer = Buffer.from(base64, 'base64')
    fs.appendFile(path, dataBuffer, function (err) {
        if (err) {
            throw err
        }
    })
    fs.appendFile(('./public/historyImg/' + imgName), dataBuffer, function (err) {
        if (err) {
            throw err
        }
    })
    const param1 = { id: req.id }
    const param2 = { img: imgName }
    const data = await update(param1, param2, 'user')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '修改成功'
    }
})

// 添加视频
router.post("/addVideo", async (ctx, next) => {
    const file = ctx.request.files.file // 获取上传文件
    // 创建可读流
    const reader = fs.createReadStream(file.path)
    const fileName = Date.now() + file.name
    let filePath = path.join('./public/video/') + `/${fileName}`
    // 创建可写流
    const upStream = fs.createWriteStream(filePath)
    // 可读流通过管道写入可写流
    reader.pipe(upStream)
    ctx.body = {
        "code": 200,
        "rows": fileName,
        "msg": '上传成功'
    }
})

// 添加图片
router.post("/addImg", async (ctx, next) => {
    const req = ctx.request.body
    const imgName = Date.now() + '.jpg'
    const path = './public/video/' + imgName
    const base64 = req.img.replace(/^data:image\/\w+;base64,/, "")
    const dataBuffer = Buffer.from(base64, 'base64')
    fs.appendFile(path, dataBuffer, function (err) {
        if (err) {
            throw err
        }
    })
    ctx.body = {
        "code": 200,
        "rows": imgName,
        "msg": '上传成功'
    }
})

// 删除答卷
router.get("/deleteReport", async (ctx, next) => {
    const sql = { _id: new ObjectId(ctx.query.id) }
    const data = await deleteData(sql, 'report')
    ctx.body = {
        "code": 200,
        "rows": data,
        "msg": '删除成功'
    }
})

module.exports = router;