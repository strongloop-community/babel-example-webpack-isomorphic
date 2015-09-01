import { createServer } from 'http'
import React from 'react'
import Stroop from '../shared/stroop'
import getRandomColorName from '../shared/getRandomColorName'

const server = createServer()

server.on('request', (req, res) => {
  const data = {
    color: getRandomColorName(),
    name: getRandomColorName()
  }

  const stroop = React.renderToString(
    <Stroop name={data.name} color={data.color} />
  )

  const html = React.renderToStaticMarkup(
    <html>
      <body>
        <div id='app' dangerouslySetInnerHTML={{__html: stroop}} />
      </body>
    </html>
  )

  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.end('<!doctype html>' + html)
})

server.listen(3000)
