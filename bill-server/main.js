const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const requests = []
const payments = {}

app.post('/send', async function (req, res) {
  const { who, bros, amount, reason } = req.body
  requests.push({
    uuid: uuidv4(),
    who,
    bros,
    amount,
    reason,
    paid: [],
  })
  res.send({
    message: 'Ok got it bro!'
  })
})

app.get('/my-claims', async function (req, res) {
  const myRequests = requests.filter(request => request.who === req.query.who)
  res.send(myRequests)
})

app.get('/my-debts', async function (req, res) {
  const query = requests.filter(request => request.bros.includes(req.query.who) && request.who !== req.query.who)
  const myDebt = query.map(e => (
    {
      ...e,
      amount: e.amount / e.bros.length,
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

app.put('/pay-request', async function (req, res) {
  const uuid = req.query.uuid
  const index = requests.findIndex(request => request.uuid === uuid)
  requests[index].paid.push(req.query.who)
  res.send({
    message: 'Ok noted bro!'
  })
})

app.put('/undo-pay-request', async function (req, res) {
  const uuid = req.query.uuid
  const index = requests.findIndex(request => request.uuid === uuid)
  const indexPaid = requests[index].paid.findIndex(paid => paid === req.query.who)
  requests[index].paid.splice(indexPaid, 1)
  res.send({
    message: 'Ok noted bro!'
  })
})

app.put('/update-payment', async function (req, res) {
  const who = req.body.who
  payments[who] = req.body.payment
  res.send({
    message: 'Ok noted bro!'
  })
})

app.get('/payments', async function (req, res) {
  res.send(payments)
})

const port = process.env.PORT || 6969
app.listen(port, () => {
  console.log(`Bill server listening at http://localhost:${port}`)
})
