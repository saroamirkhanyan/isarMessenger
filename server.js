
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

const bodyParser = require('body-parser')
let PORT = process.env.PORT || 80;

let rooms = {};
class Room {

	constructor(roomName, userName) {
		if (rooms[roomName]) {
			if (userName in rooms[roomName]) {
				this.err = true;
			}
			else {
				rooms[roomName].length +=1;
				rooms[roomName][userName] = { on: false };
				this.err = false;
			}

		}

		else {
			rooms[roomName] = {
				length:1,
				[userName]: { on: false },
				
			}
			this.err = false;
		}

	}
	static roomLength(roomName) {
		var size = 0, key;
		for (key in rooms[roomName]) {
			if (rooms[roomName].hasOwnProperty(key)) size++;
		}
		return size;
	}

	static checkUser(roomName, userName) {
		if ((roomName in rooms) && (userName in rooms[roomName])) {
			if (!rooms[roomName][userName].on) {
				rooms[roomName][userName].on = true;
				return true;
			}

		}
		return false;
	}

	static deleteUser(roomName, userName) {
		if (roomName in rooms && userName in rooms[roomName]) {
			if (rooms[roomName].length == 1) {
				console.log('Room Deleted!')
				delete rooms[roomName];
			} else {
				delete rooms[roomName][userName];
				rooms[roomName].length--;
			}
		}


	}
}



app.use(express.urlencoded({ extended: false }))
app.use(bodyParser())
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.get('/', (req, res) => { res.render('Index/index');console.log(rooms) })

app.get('/search',(req,res)=>{
	let RoomNames = Object.keys(rooms);
	for(let i = 0;i<RoomNames.length;i++){
		if(req.query.keyword == RoomNames[i]){
			return res.send({err:false,response:true})
		}
	}
	return res.send({err:false,response:false})
	
})

app.get('/getrooms', (req, res) => {
	let RoomNames = Object.keys(rooms);
	if(!RoomNames.length) return res.send({err:false,rooms:[]});
	else if(RoomNames.length && RoomNames.length < 2) return res.send({err:false,rooms:RoomNames});
	for(let i = 0;i<RoomNames.length-1;i++){
		for(let j =0;j<RoomNames.length-1-i;j++){
			if(+rooms[RoomNames[j]].length < +rooms[RoomNames[j+1]].length){
				[RoomNames[j],RoomNames[j+1]] = [RoomNames[j+1],RoomNames[j]] 
			}
		}
		
	}
	return res.send({err:false,rooms:RoomNames.slice(0,10)});
	console.log(RoomNames)

})

app.post('/room', (req, res) => {
	let roomName = req.body.roomName;
	let userName = req.body.userName;
	if (roomName && userName) {

		if (new Room(roomName, userName).err) {
			res.send({ err: true })
		} else {
			res.send({ err: false, roomName, userName })
		}

	}

})


app.get('/room', (req, res) => {
	let roomName = req.query.roomName;
	let userName = req.query.userName;
	if (!roomName || !userName) return res.redirect('/');
	if (Room.checkUser(roomName, userName)) {

		return res.render('Room/room', { roomName, userName })
	}
	else {
		return res.redirect('/')
	}
})


const interavalDuration = 1000 * 60 * 6;



io.on('connection', (socket) => {

	socket.on('joinRoom', (userData) => {
		if (Room.checkUser(userData.roomName, userData.userName)) { socket.disconnect(true) }

		let intervalID = null;

		function intervalManager(flag, animate, time) {
			if (flag)
				intervalID = setInterval(animate, time);
			else
				clearInterval(intervalID);
		}


		userData.active = false;
		function checkActive() {
			if (userData.active) { userData.active = false; }
			else {
				console.log(userData.userName + 'AutoDisconnected!')
				socket.disconnect(true)
				intervalManager(false)

			}

		}

		intervalManager(true, checkActive, interavalDuration)


		socket.emit('users', Object.keys(rooms[userData.roomName]).slice(1))

		socket.join(userData.roomName);

		socket.to(userData.roomName).emit('newuserjoined', userData.userName);

		socket.on('sendMessage', (messageData) => {
			userData.active = true;
			//console.log(userData,messageData)
			socket.to(userData.roomName).emit("getMessage", { text: messageData.text, author: userData.userName })
		})

		socket.on('sendTyping', () => {
			socket.to(userData.roomName).emit('getTyping', userData.userName)
		})

		socket.on('disconnect', () => {
			intervalManager(false);
			Room.deleteUser(userData.roomName, userData.userName);
			socket.to(userData.roomName).emit('disConnected', userData.userName)
			//console.log(userData.userName + " Disconencted!")
		})


	})
})

server.listen(PORT, () => { console.log(`Server Listened is ${PORT} PORT!`) })