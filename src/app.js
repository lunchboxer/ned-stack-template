import { join } from 'node:path'
import connectLivereload from 'connect-livereload'
import express from 'express'
import livereload from 'livereload'
import nunjucks from 'nunjucks'
import { errorHandler } from './errorHandler.js'
import { userRouter } from './routes/user.js'

const __dirname = import.meta.dirname

const dev = process.env.NODE_ENV !== 'production'

const appCssPath = join(__dirname, '../public/app.css')

if (dev) {
  const liveReloadServer = livereload.createServer()
  liveReloadServer.watch([__dirname, appCssPath])
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })
}

const app = express()

if (dev) {
  app.use(connectLivereload({ port: 35729 }))
}

// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

nunjucks.configure(join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  noCache: dev,
})

app.use('/static', express.static(join(__dirname, '../public')))

app.set('view engine', 'html')

app.get('/', (_, res) => {
  res.render('index.html', { title: 'Home Page' })
})
app.use('/users', userRouter)

app.use(errorHandler)

app.use((req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.render('404.html', { url: req.url })
    return
  }

  if (req.accepts('json')) {
    res.json({ error: 'Not found' })
    return
  }
  res.type('txt').send('Not found')
})

const PORT = 3000
app.listen(PORT, () => {
  console.info(`Server running on http://localhost:${PORT}`)
})
