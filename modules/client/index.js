import React from 'react'
import Stroop from '../shared/stroop'

document.addEventListener('DOMContentLoaded', _ => {
  const app = document.getElementById('app')
  React.render(<Stroop {...window.SERVER_DATA} />, app)
})
