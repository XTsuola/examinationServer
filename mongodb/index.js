var MongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/"

let pool

MongoClient.connect(url, function (err, db) {
  if (err) throw err
  pool = db
})

function queryAll(data, tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).find(data).toArray(function (err, result) { // 返回集合中所有数据
      if (err) reject(err)
      resolve(result)
    })
  })
}

function querySome(data1, data2, tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).find(data1).project(data2).toArray(function (err, result) { // 返回集合中所有数据
      if (err) reject(err)
      resolve(result)
    })
  })
}

function queryOne(data, tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).findOne(data).then(resolve).catch(reject)
  })
}

function update(data1, data2, tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).update(data1, { $set: data2 }).then(resolve).catch(reject)
  })
}

function add(data, tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).insert(data).then(resolve).catch(reject)
  })
}

function findLast(tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).find({}).sort({ _id: -1 }).limit(1).toArray().then(resolve).catch(reject)
  })
}

function deleteData(data, tableName) {
  return new Promise((resolve, reject) => {
    var dbo = pool.db("work")
    dbo.collection(tableName).deleteOne(data).then(resolve).catch(reject)
  })
}

module.exports = {
  queryAll,
  querySome,
  queryOne,
  update,
  add,
  findLast,
  deleteData
}