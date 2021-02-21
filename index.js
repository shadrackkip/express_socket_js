let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html')
});

let sockets = {}
let online=[]
let users = []

function getKeyByValue(object, sender,receiver) {
    return Object.keys(object).find(key => object[key][1] === sender && object[key][0]===receiver);
  }

io.on('connection', (socket) => {
   online.push(socket.id)
   socket.on('set-user-online',(userData)=>{
    let user_msg_data=[]
    user_msg_data.push(userData.user_id,userData.receiver,userData.socket_id)
    sockets[userData.socket_id] = user_msg_data

})
socket.emit('onlineers',online)

    
    socket.on('message', (msg) => {
        let sock=getKeyByValue(sockets, msg.user_id,msg.receiver) // retrieving receiver socket
        io.to(msg.socket_id).emit('private_message', msg);//send  to sender socket
        io.to(sock).emit('private_message', msg); // send also to receiver socket
      });





    socket.on('disconnect', () => {
      // console.log('user disconnected');
       delete sockets[socket.id];
  
        let sock_index = online.indexOf(socket.id)
        online.splice(sock_index)
       
      
       io.emit('offline',socket.id)
    
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});