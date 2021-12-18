import React from 'react'
import { Link } from 'react-router-dom'

import { capitalizeFirstLetter } from './utils'

import { list } from './list'

function Select() {
  return (<React.Fragment>
    <h1>Bro, who are you?</h1>
    {list.map(name => <p key={name}><Link to={"/" + name}><button>I'm {capitalizeFirstLetter(name)}</button></Link></p>)}
  </React.Fragment>)
}

export default Select
