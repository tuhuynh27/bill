const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const requests = []

app.post('/send', async function (req, res) {
  const { who, amount, reason } = req.body
  requests.push({
    uuid: uuidv4(),
    who,
    amount,
    reason,
    paid: [],
  })
  res.send({
    message: 'Ok got it bro!'
  })
})

app.get('/my-requests', async function (req, res) {
  const myRequests = requests.filter(request => request.who === req.query.who)
  res.send(myRequests)
})

app.get('/my-debts', async function (req, res) {
  const query = requests.filter(request => request.who !== req.query.who)
  const myDebt = query.map(e => (
    {
      ...e,
      amount: e.amount / 4
    }
  ))
  res.send(myDebt)
})

app.delete('/delete-request', async function (req, res) {
  const uuid = req.query.uuid
  const index = requests.findIndex(request => request.uuid === uuid)
  requests.splice(index, 1)
  res.send({
    message: 'Ok deleted it bro!'
  })
})

app.put('/paid-request', async function (req, res) {
  const uuid = req.query.uuid
  const index = requests.findIndex(request => request.uuid === uuid)
  requests[index].paid.push(req.query.who)
  res.send({
    message: 'Ok noted bro!'
  })
})

const port = process.env.PORT || 6969
app.listen(port, () => {
  console.log(`Bill server listening at http://localhost:${port}`)
})
