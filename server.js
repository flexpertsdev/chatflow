const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
// We'll initialize socket after the build is complete

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.io initialization will be added after TypeScript compilation

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})