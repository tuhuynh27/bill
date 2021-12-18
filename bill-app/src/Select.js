import React from 'react'

import { capitalizeFirstLetter } from './utils'

const list = ['quang', 'lam', 'toet', 'tu']

function Select({ onChange }) {
  return (<React.Fragment>
    <h1>Bro, who are you?</h1>
    {list.map(name => <p key={name}><button onClick={() => onChange(name)}>I'm {capitalizeFirstLetter(name)}</button></p>)}
  </React.Fragment>)
}

export default Select
