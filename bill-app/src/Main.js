import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'

import Select from 'react-select'

import { capitalizeFirstLetter } from './utils'
import { showMessage } from './snackbar'

import { list } from './list'

const options = list.map(e => ({ value: e, label: capitalizeFirstLetter(e) }))

function Main() {
  const { name } = useParams();
  const [bros, setBros] = useState(list);
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const [sent, setSent] = useState([])
  const [paid, setPaid] = useState([])
  const [payments, setPayments] = useState({})

  const [isUpdatePaymentMode, setIsUpdatePaymentMode] = useState(false)
  const [paymentText, setPaymentText] = useState('')

  const getMyRequests = useCallback(async () => {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/my-claims?who=${name}`, {
        method: 'GET',
      })
      const json = await resp.json()
      setSent(json)
    } catch (err) {
      showMessage(err)
    }
  }, [name])

  const getMyDebts = useCallback(async () => {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/my-debts?who=${name}`, {
        method: 'GET',
      })
      const json = await resp.json()
      setPaid(json)
    } catch (err) {
      showMessage(err)
    }
  }, [name])

  const getPayments = useCallback(async () => {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/payments?`, {
        method: 'GET',
      })
      const json = await resp.json()
      setPayments(json)
    } catch (err) {
      showMessage(err)
    }
  }, [])

  useEffect(() => {
    void getMyRequests()
    void getMyDebts()
    void getPayments()
  }, [getMyDebts, getMyRequests, getPayments])

  async function sendRequest(amount, reason) {
    if (bros.length === 0) {
      showMessage('No bros to send request to')
      return
    }
    if (amount === '' || reason === '') {
      showMessage('Please fill all fields')
      return
    }
    amount = parseInt(amount)
    if (amount <= 0 || isNaN(amount)) {
      showMessage('Amount must be a positive number')
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
          bros,
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
      await getPayments()
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
      await getPayments()
    } catch (err) {
      showMessage(err)
    }
  }

  async function paidRequest(uuid) {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/pay-request?uuid=${uuid}&who=${name}`, {
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

  async function undoPaidRequest(uuid) {
    try {
      const resp = await fetch(`https://bill-api.tuhuynh.com/undo-pay-request?uuid=${uuid}&who=${name}`, {
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

  function handleBrosChange(e) {
    setBros(e.map(e => e.value))
  }

  async function updatePaymentInformation() {
    if (paymentText === '') {
      showMessage('Please fill all fields')
      return
    }
    try {
      const resp = await fetch('https://bill-api.tuhuynh.com/update-payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          who: name,
          payment: paymentText
        })
      })
      const json = await resp.json()
      showMessage(json.message)
      await getPayments()
    } catch (err) {
      showMessage(err)
    } finally {
      setIsUpdatePaymentMode(false)
      setPaymentText('')
    }
  }

  return (
    <React.Fragment>
      <div style={{ textAlign: 'right' }}><Link to='/'><button>Back</button></Link></div>
      <h1>Hello {capitalizeFirstLetter(name)}!</h1>
      {!isUpdatePaymentMode && <p>{payments[name] || 'Payment inf. not updated yet'}</p>}
      {!isUpdatePaymentMode &&
        <p>Click <button className="small-button"
                         onClick={() => setIsUpdatePaymentMode(true)}>here</button> to update your payment information</p>}
      {isUpdatePaymentMode && <div>
        <textarea value={paymentText} onChange={e => setPaymentText(e.target.value)} placeholder="Paynow 12345678 (John Smith)" style={{ width: '300px', height: '75px' }} />
        <p style={{ textAlign: 'center' }}>
          <button onClick={updatePaymentInformation}>Save</button> or <button style={{ backgroundColor: 'darkslategray' }}
                                                               onClick={() => setIsUpdatePaymentMode(false)}>Discard</button>
        </p>
      </div>}
      <h3>Who joined this bill?</h3>
      <Select
        isMulti
        options={options}
        defaultValue={options}
        onChange={handleBrosChange}
      />
      <p>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Bill total ($)" />
      </p>
      <p>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Note (what bill?)" />
      </p>
      <p>
        <button onClick={() => sendRequest(amount, reason)}>Claim!</button>
      </p>
      {<h3>Your claimed bills:</h3>}
      {sent.length === 0 && <p>None</p>}
      {sent.map(({ uuid, amount, reason, paid }) => (
        <p key={uuid}>
          Claimed {amount}$ for "{reason}"
          ({paid.length > 0 ? paid.map(e => capitalizeFirstLetter(e)).join(', ') : 'No one have'} paid) <button className="small-button" onClick={() => deleteRequest(uuid)}>delete</button>
        </p>
      ))}
      {<h3>Please pay back to your bros:</h3>}
      {paid.length === 0 && <p>None</p>}
      {paid.map(({ uuid, amount, reason, who, paid }) => {
        const isPaid = paid.findIndex(who => who === name) !== -1
        return (
          <p key={uuid} style={{
            textDecoration: isPaid ? 'line-through' : 'none'
          }}>
            Pay back {capitalizeFirstLetter(who)} {amount}$ for "{reason}"&nbsp;
            {!isPaid ?
              <span>({payments[who] || 'no payment inf.'}) <button className="small-button" onClick={() => paidRequest(uuid)}>paid</button></span> :
              <span>(already paid) <button className="small-button" onClick={() => undoPaidRequest(uuid)}>unpaid</button></span>}
          </p>
        )
      })}
    </React.Fragment>
  )
}

export default Main
