var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server)
var rooms = {};
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine','ejs')
app.get('/',(req,res)=>{res.render('index',{'err':''})})
app.post('/room',(req,res)=>{res.redirect(`/${req.body.room}/${req.body.name}`)})
app.get('/:room/:name',(req,res)=>{
	if(rooms[req.params.room] != null){
		if(rooms[req.params.room]['users'][req.params.name] != null){
			res.redirect('/')

		}
		else{
			rooms[req.params.room]['users'][req.params.name] = {}
			res.render('room',{room:req.params.room,name:req.params.name,users:rooms[req.params.room]['users']})
		}
	
	}
	else{
		
		rooms[req.params.room] = {users:{}}
		res.render('room',{room:req.params.room,name:req.params.name,users:rooms[req.params.room]['users']})
		console.log(req.params.name + ' Create New Room : ' + req.params.room)
	}
})
io.on('connection',(socket)=>{
	socket.on('join_room',(room,name)=>{
		console.log(name + ' Conntected in ' + room)
		socket.join(room)
		rooms[room]['users'][name ] = {};
		socket.to(room).emit('joined',name)
		socket.on('disconnect', ()=> {
        console.log(name + ' turned off from ' + room )
        delete rooms[room]['users'][name];  
        socket.to(room).emit('disconn',name)
          });
		 socket.on('message',(name,message)=>{
		 	console.log(name + ' wrote: ' + message + ' in ' + room)
		 	socket.to(room).emit('message',name,message)
		 })

	})

		
})

server.listen(3000,()=>{console.log("Server Listened is 3000 PORT!")})