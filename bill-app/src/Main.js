import React, { useEffect, useState } from 'react'

import { capitalizeFirstLetter } from './utils'
import { showMessage } from './snackbar'

function Main({ name }) {
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')

  const [sent, setSent] = useState([])
  const [paid, setPaid] = useState([])

  useEffect(() => {
    void getMyRequests()
    void getMyDebts()
  }, [])

  async function sendRequest(amount, reason) {
    amount = parseInt(amount)
    if (amount <= 0) {
      showMessage('Amount must be greater than 0')
      return
    }
    if (!reason) {
      showMessage('Reason is required')
      return
    }
    try {
      const resp = await fetch('https://bill-api.tuhuynh.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          who: name,
          amount,
          reason
        })
      })
      const json = await resp.json()
      showMessage(json.message)
      setAmount(0)
      setReason('')

      await getMyRequests()
      await getMyDebts()
    } catch (err) {
      showMessage(err)
    }
  }

  async function getMyRequests() {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/my-requests?who=${name}`, {
        method: 'GET',
      })
      const json = await resp.json()
      setSent(json)
    } catch (err) {
      showMessage(err)
    }
  }

  async function getMyDebts() {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/my-debts?who=${name}`, {
        method: 'GET',
      })
      const json = await resp.json()
      setPaid(json)
    } catch (err) {
      showMessage(err)
    }
  }

  async function deleteRequest(uuid) {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/delete-request?uuid=${uuid}`, {
        method: 'DELETE',
      })
      const json = await resp.json()
      showMessage(json.message)
      await getMyRequests()
      await getMyDebts()
    } catch (err) {
      showMessage(err)
    }
  }

  async function paidRequest(uuid) {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/paid-request?uuid=${uuid}&who=${name}`, {
        method: 'PUT',
      })
      const json = await resp.json()
      showMessage(json.message)
      await getMyRequests()
      await getMyDebts()
    } catch (err) {
      showMessage(err)
    }
  }

  return (
    <React.Fragment>
      <h1>Hello {capitalizeFirstLetter(name)}</h1>
      <h3>Request repay to your bros</h3>
      <p>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount to request ($)" />
      </p>
      <p>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Note (reason)" />
      </p>
      <p>
        <button onClick={() => sendRequest(amount, reason)}>Claim repay!</button>
      </p>
      {sent.length > 0 && <h3>Your sent claims: {sent.length}</h3>}
      {sent.map(({ uuid, amount, reason }) => (
        <p key={uuid}>
          Claimed {amount}$ for "{reason}" <button className="small-button" onClick={() => deleteRequest(uuid)}>delete</button>
        </p>
      ))}
      {paid.length > 0 && <h3>Your paid requests: {paid.length}</h3>}
      {paid.map(({ uuid, amount, reason, who, paid }) => {
        const isPaid = paid.findIndex(who => who === name) !== -1
        return (
          <p key={uuid} style={{
            textDecoration: isPaid ? 'line-through' : 'none'
          }}>
            Pay back {capitalizeFirstLetter(who)} {amount}$ for "{reason}"
            {!isPaid ? <button className="small-button" onClick={() => paidRequest(uuid)}>paid</button> : <span>(already paid)</span>}
          </p>
        )
      })}
    </React.Fragment>
  )
}

export default Main
