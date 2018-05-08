// 流程
/**
 * 1.获取本机SDP（一种数据格式，端到端连接时协商参数）描述符并交换
 *    ·A createOffer() 建立一个offer信令，拿到SDP
 *    ·A setLocalDescription()设置机器的本地描述
 *    ·A 通过服务器发送offer信令
 *    ·B 接收A offer信令，B通过setRemoteDescription()设置远程机器描述
 *    ·B createAnswer()建立answer信令，获得SDP
 *    ·B setLocalDescription() 设置B机器本地描述
 *    ·B 通过服务器将answer信令发送给A
 *    ·A接收answer信令， A 通过setRemoteDescription()设置B机器描述
 *    ·至此A，B都拿到了各自的SDP描述
 * 
 * 2. 通过ICE（建立连接，用于收集两端间的公共线路IP）框架连接两段主机的网络地址
 *   ·在实例化RTCPeerConnection对象的时候可以传入ICE服务器的地址。我们可以使用谷歌提供的『stun:stun.l.google.com:19302』或者Mozilla提供的『stun:stun.services.mozilla.com』
 *   ·demo
 *      var configuration = {iceServers: [{url: "stun:stun.l.google.com:19302"}]};
        var rpc = new RTCPeerConnection(configuration);
     ·在rpc上绑定onicecandidate事件的回调函数，当网络候选可用时这个函数会被调用，在这个回调函数中，本机可以拿到ice candidate信令，然后通过服务器发给远程机器，远程机器通过自己的rpc实例的addIceCandidate()方法添加，同样地，远程机器也应该将自己的ice candidate信令通过服务器发送给本机。
      当双方的ice candidate交换完成时，连接就建立成功了，可以在rpc示例上调用addStream()来添加流，另一边通过绑定onaddstream事件就可以获取到传过去的流。
      服务器通信部分，没有规定必须要用某种协议，所以只要能在两边传输消息的技术可以使用，例如WebSocket、XHR等，大家自行选择即可。
 * 
*/
var server = require('./server.js')
var log = require('./log').log
var port = process.argv[2] || 5001

// 404
function fourohfour (info) {
  let res = info.res
  log('request handler 404 was called.')
  res.writeHead(404, {'Content-type': 'text/plain'})
  res.write('404 page not found')
  res.end()
}

var handle = {}
handle['/'] = fourohfour

server.serverFilePath('static')
server.start(handle, port)