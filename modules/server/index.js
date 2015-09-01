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

  const stroop = React.renderToString(<Stroop {...data} />)

  const serverData = `window.SERVER_DATA = ${JSON.stringify(data)}`

  const html = React.renderToStaticMarkup(
    <html>
      <head>
        <script dangerouslySetInnerHTML={{__html: serverData}} />
        <script src='http://localhost:3001/bundle.js'></script>
      </head>
      <body>
        <div id='app' dangerouslySetInnerHTML={{__html: stroop}} />
      </body>
    </html>
  )

  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.end('<!doctype html>' + html)
})

server.listen(3000)
