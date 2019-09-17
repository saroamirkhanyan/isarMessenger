//Miacum Gradarannerin
let express = require('express');
let app 	= express();
let server 	= require('http').Server(app);
let io 		= require('socket.io')(server);
//Serveri Porti Haytararum
let PORT 	= process.env.PORT || 80;
// Senyakneri Ojecti Haytararum
let rooms 	= {};
//Senyakineri Xekavarman Funkcianer
var setroom = {
	create:function(room,name){
		rooms[room] = {};
		rooms[room][name] = {};
		console.log(`${name} -y stexcec senyak ${room} anunov`)
		console.log(`${name} mtav ${room}`)
	},
	newuser:function (room,name) {
		rooms[room][name] = {};
		console.log(`${name} mtav ${room}`)
	},
	removeuser:function (room,name){
		delete rooms[room][name];
		console.log(`${name} -y durs ekav ${room} - ic`)
	},
	remove:function (room) {
		delete rooms[room];
	}
}
//Senyaknery hashvelu funkcia
Object.size = function(obj) {
var size = 0, key;
for (key in obj) {
if (obj.hasOwnProperty(key)) size++;
	 }
return size;
	};
// popoxakani arkayutyan stugman funkcia
function isset(variable){
    if( typeof variable !== 'undefined' ) {
        return true;
    }
    return false;
}	

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine','ejs');
app.get('/',(req,res)=>{res.render('index')})
app.post('/room',(req,res)=>{
	let room =req.body.room;
	let name = req.body.name;
	if(room == '' || name == ''){console.log('Tvyalnery Mutqagrvac chen!');res.redirect('/')}
	else{res.redirect(`/${room}/${name}`)}
	})
app.get('/:room/:name',(req,res)=>{
	let room = req.params.room;
	let name = req.params.name;
	if(rooms[room] != undefined){
		if(rooms[room][name] != undefined){
			res.redirect('/')
		}
		else{
			setroom.newuser(room,name);
			res.render('room',{'room':room,'name':name,'users':rooms[room]})
		}
	}
	else{
		setroom.create(room,name);
		res.render('room',{'room':room,'name':name,'users':rooms[room]})
	}
})

io.on('connection',(socket)=>{

	socket.on('join_room',(room,name)=>{
		//setTimeout(() => socket.disconnect(true), 1000 *60 * 15);
		socket.join(room);
		
		socket.to(room).emit('joined_user',name);
		
		socket.on('disconnect', (reason) => {
  			socket.to(room).emit('disconnected',name);	
			if(room in rooms){
        		if(name in rooms[room]){ 
        			    setroom.removeuser(room,name) 
						let size = Object.size(rooms[room]);
						if (size == 0) {setroom.remove(room)}
        		}else{}
        	}else{}
 		 });

		 socket.on('message',(name,message)=>{
		 	console.log(name + ' wrote: ' + message + ' in ' + room)
		 	socket.to(room).emit('message',name,message)
		 })

		  socket.on('typing', (name) => {
		  socket.to(room).emit('typing',name)
		  });
	})
})
server.listen(PORT,()=>{console.log(`Server Listened is ${PORT} PORT!`)})