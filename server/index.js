const express = require('express');
const socketio = require("socket.io");
const app = express();
const router = require('./router');
const users = require('./users').usersObject;
const cors = require("cors");

app.use(router);

app.use(cors());
var server = app.listen(5000, function () {
	console.log("Listening to port 5000")
})


const io = socketio(server);

io.on("connection",function(socket){
	console.log('new connection');

	socket.on('join',function({name,room},callback){
		const {error,user} = users.addUser({id : socket.id, name ,room});
		if(error)
			callback(error)
		socket.join(user.room);
		console.log(user)
		socket.emit('message',{user : 'Admin', text : `${user.name} Welcome to the room ${user.room}`})
		socket.broadcast.to(user.room).emit('message',{user : 'Admin', text : `${user.name} has joined`})
		io.to(user.room).emit('roomData',{room : user.room, users : users.getUsersInRoom(user.room)})

		callback();
	})

	socket.on('sendMessage',function(message,callback){
		const user = users.getUser(socket.id);

		io.to(user.room).emit('message',{user : user.name, text : message})
		io.to(user.room).emit('roomData',{room : user.room, users : users.getUsersInRoom(user.room)})


		callback();
	})
		// const error = true;
		// callback({error : 'error'})

	socket.on("disconnect",function(){
		const user = users.removeUser(socket.id);
		if(user)
			io.to(user.room).emit('message',{user : 'Admin', text : `${user.name} has left`})
	})

})
