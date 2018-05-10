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
    log('request for ' + pathname + ' received')

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
  var components = pathname.substr(1).split('/')
  var filtered = []
  var temp = null
  log(components, pathname, 'components')
  var len = components.length

  for(var i = 0; i<len; i++) {
    temp = components[i]
    if (temp == '..') continue
    if (temp == '') continue
    temp = temp.replace(/~/g, '')
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
    let readBuffer = new Buffer(20480)
  })
  fs.read(fd, readBuffer, 0, 20480, 0, function (err, readBytes) {
    if(err) {
      log(err.message)
      fs.close(fd)
      noHandleErr(filepath, res)
      return
    }
    log('just read' + readBytes + 'bytes')
    if(readBytes > 0) {
      res.writeHead(200, {'Content-type':ContentType(filepath)})
      res.write(readBuffer.toString('utf8', 0, readBytes))
    }
    res.end()
  })
}
// 确定所提取的文件的内容类型
function contentType (filepath) {
  let index = filepath.lastIndexOf('.')
  if (index >= 0) {
    switch(filepath.substr(index+1)) {
      case 'html': return ('text/html');
      case 'js': return ('application/javascript');
      case 'css': return ('text/css');
      case 'txt': return ('text/plain');
      default: return ('text/html')
    }
  }
  return ('text/html')
}
// 确认非文件路径的处理程序，然后执行该程序
function handleCustom (handle, pathname, info) {
  if (typeof handle[pathname] == 'function') {
    handle[pathname](info)
  }else {
    noHandlerErr(path, info, res)
  }
}
// 如果没有定义处理程序，返回404
function noHandleErr(pathname, res) {
  log('no request handler found for ' + pathname)
  res.writeHead(404, {'Content-Type': 'text/plain'})
  res.write('404 page not found')
  res.end()
}
