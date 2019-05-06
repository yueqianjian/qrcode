const path = require("path")
const url = require("url")
const fs = require("fs")
const express = require("express")
const app = express()
const bodyParser = require('body-parser');
const UUID = require("uuid-js")

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "client/dist")))

app.get('/api/getQRCode', (req, res) => {
  const uuid = UUID.create().toString()
  const writeData = {
    uuid,
    status: 0
  }
  setJSONValue(path.join(__dirname, 'data.json'), uuid, writeData)
  res.end(uuid)
})

app.get('/api/checkQRCode', (req, res) => {
  const uuid = url.parse(req.url, true).query.uuid
  const readData = getJSONValue(path.join(__dirname, 'data.json'), uuid)
  res.end(JSON.stringify(readData))
})

app.post('/api/scanned', (req, res) => {
  const {
    uuid,
    userInfo
  } = req.body
  const readData = getJSONValue(path.join(__dirname, 'data.json'), uuid)

  readData.status = 1
  readData.userInfo = userInfo
  setJSONValue(path.join(__dirname, 'data.json'), uuid, readData)
  res.end()
})

app.get('/api/login', (req, res) => {
  const uuid = url.parse(req.url, true).query.uuid
  const readData = getJSONValue(path.join(__dirname, 'data.json'), uuid)

  readData.status = 2
  setJSONValue(path.join(__dirname, 'data.json'), uuid, readData)
  res.end(JSON.stringify(readData))
})

function setJSONValue(fileName, uuid, writeData) {
  const jsonData = fs.readFileSync(fileName)
  const obj = JSON.parse(jsonData.toString())
  const {
    data
  } = obj
  let flag = false
  data.forEach((e, i) => {
    if (e.uuid === uuid) {
      flag = true
      data[i] = writeData
    }
  })
  if (!flag) {
    data.push(writeData)
  }
  const writeJSON = JSON.stringify({
    data
  });
  fs.writeFileSync(fileName, writeJSON);
}

function getJSONValue(fileName, uuid) {
  const jsonData = fs.readFileSync(fileName)
  const obj = JSON.parse(jsonData.toString())
  const {
    data
  } = obj
  let readData = null
  data.forEach(e => {
    if (e.uuid === uuid) {
      readData = e
    }
  });
  return readData
}

app.listen(3000, () => {
  console.log(`open http://localhost:3000`)
});