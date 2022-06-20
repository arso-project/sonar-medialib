const { app, BrowserWindow } = require('electron')
const { startSonarAndRemix } = require('../launch.js')

run().catch(err => {
  console.error('Error: ' + err.message)
  console.log(err)
})

async function run () {
  let win
  let mainURL
  let closeRemixAndSonar
  const pendingFile = '../public/pending.html'
  ;(async () => {
    console.log('initializing sonar and remix')
    try {
      const { close, remixURL } = await startSonarAndRemix()
      closeRemixAndSonar = close
      mainURL = remixURL
      if (win) win.loadURL(remixURL)
    } catch (err) {
      console.error(`initializing failed: ${err}`)
    }
  })()

  app.whenReady().then(() => {
    win = new BrowserWindow({
      width: 1024,
      height: 768
    })
    if (mainURL) win.loadURL(mainURL)
    else win.loadFile(pendingFile)
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
      if (closeRemixAndSonar) closeRemixAndSonar()
    }
  })
}
