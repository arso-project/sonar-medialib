const { app, BrowserWindow } = require('electron')
const findFreePort = require('find-free-port')
const path = require('path')

run().catch(err => {
  console.error('Error: ' + err.message)
  console.log(err)
})

function createWindow (url) {
  const win = new BrowserWindow({
    width: 1024,
    height: 768
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js')
    // }
  })
  // win.setMenu(null)
  // win.loadFile('dist/index.html')
  console.log(`Opening window for ${url}`)
  return win
}

async function run () {
  let win
  let remixURL
  const closing = []
  const pendingFile = '../public/pending.html'
  ;(async () => {
    console.log('initializing sonar and remix')
    try {
      const [sonarServer, sonarOpts] = await startSonar()
      closing.push(() => sonarServer.close())
      remixURL = await startRemix({ sonar: sonarOpts })
      if (win) win.loadURL(remixURL)
    } catch (err) {
      console.error(`initializing failed: ${err}`)
    }
  })()

  app.whenReady().then(() => {
    win = createWindow(remixURL || pendingFile)
    if (remixURL) win.loadURL(remixURL)
    else win.loadFile(pendingFile)
    // app.on('activate', () => {
    //   if (BrowserWindow.getAllWindows().length === 0) {
    //     createWindow(remixURL)
    //   }
    // })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
      for (const close of closing) close()
    }
  })
}

async function startRemix (opts = {}) {
  process.env.SONAR_URL = opts.sonar.url
  process.env.SONAR_COLLECTION = opts.sonar.collection
  process.chdir('..')
  const port = opts.port || (await findFreePort(15000))[0]
  require('@remix-run/serve/env.js')
  const { createApp } = require('@remix-run/serve/index.js')
  const hostname = 'localhost'
  const buildPath = path.resolve(process.cwd(), 'build')
  const url = `http://${hostname}:${port}`
  await new Promise((resolve, reject) => {
    createApp(buildPath).listen(port, hostname, () => {
      console.log(`Remix App Server started at ${url}`)
      resolve()
    })
  })
  return url
}

async function startSonar () {
  const Server = require('@arsonar/server/server.js')
  const port = (await findFreePort(15000))[0]
  const opts = {
    port,
    hostname: 'localhost',
    storage: '../.data',
    disableAuthentication: true
  }
  const server = new Server(opts)
  await server.start()
  const sonarOpts = {
    url: `http://localhost:${port}/api/v1/default`,
    collection: 'default'
  }
  console.log(`Sonar running on ${sonarOpts.url}`)
  return [server, sonarOpts]
}
