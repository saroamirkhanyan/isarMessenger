
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
				rooms[roomName][userName] = { on: false };
				this.err = false;
			}

		}

		else {
			rooms[roomName] = {
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
			if (Room.roomLength(roomName) == 1) {
				delete rooms[roomName];
			} else {
				delete rooms[roomName][userName];
			}
		}


	}
}



app.use(express.urlencoded({ extended: false }))
app.use(bodyParser())
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.get('/', (req, res) => { res.render('index') })

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

var intervalID = null;

const interavalDuration = 1000 * 60 * 6;

function intervalManager(flag, animate, time) {
   if(flag)
     intervalID =  setInterval(animate, time);
   else
     clearInterval(intervalID);
}


io.on('connection', (socket) => {
	
	socket.on('joinRoom', (userData) => {
		if(Room.checkUser(userData.roomName,userData. userName)){socket.disconnect(true)}
		userData.active = false;
		function checkActive (){
			if(userData.active){userData.active = false;}
			else{
				socket.disconnect(true)
				intervalManager(false)

			}
			
		}
		intervalManager(true,checkActive,interavalDuration)
		
		
		socket.emit('users', Object.keys(rooms[userData.roomName]))

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
			Room.deleteUser(userData.roomName, userData.userName);
			socket.to(userData.roomName).emit('disConnected', userData.userName)
			//console.log(userData.userName + " Disconencted!")
		})


	})
})

server.listen(PORT, () => { console.log(`Server Listened is ${PORT} PORT!`) })