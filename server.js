let http = require('http')
let url = require('url')
let fs = require('fs')

var log = require('./log').log
var serveFileDir = ""

function setServeFilePath (p) {
  serveFilePath = p
}
exports.serverFilePath = setServeFilePath

function start (handle, port) {
  function onRequest(req, res) {
    let urldata = url.parse(req.url, true)
    let pathname = urldata.pathname
    let info = {
      res: res
    }
    log('request for' + pathname + 'received')

    route(handle, pathname, info)
  }
  http.createServer(onRequest).listen(port)
  log('server started on port' + port)
}
exports.start = start

function route (handle, pathname, info) {
  log('About to route a request for' + pathname)
  let filepath = createFilePath(pathname)
  log('Attemping to locate' + filepath)
  fs.stat(filepath, function(err, stats) {
    if (!err && stats.isFile()) {
      serveFile(filepath, info)
    } else {
      handleCustom(handle, pathname, info)
    } 
  })
}

function createFilePath (pathname) {
  let components = pathname.substr(1).split['/']
  let filtered = []
  let temp = null

  for(let i = 0, i = components.lenght; i++;) {
    temp = components[i]
    if (temp == '..') continue
    if (temp == '') continue
    temp = temp
    filtered.push(temp)
  }
  return (serveFilePath + '/' + filtered.join('/'))
}
function serveFile (filepath, info) {
  let res = info.res
  log('Server file' + filePath)
  fs.open(filepath, 'r', function(err, fd) {
    if (err) {
      log(err.message)
      noHandleErr(filepath, res)
      return
    }
  })
}

