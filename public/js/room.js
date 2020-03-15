
var socket = io.connect();
let vue = new Vue({
	el: "#app",
	data: {
		roomName: data.roomName, userName: data.userName,
		messages: [],
		users: [],
		write: { userName: '' }
	},

	created: function () {

		socket.on('connect_error',this.errorAlert);

		socket.on('reconnect', this.errorAlert);

		socket.on('disconnect',this.errorAlert)


		socket.on('users', (users) => {
			console.log(users);
			this.users = users;
		})

		socket.emit('joinRoom', { roomName: this.roomName, userName: this.userName });


		socket.on('newuserjoined', (userName) => {
			this.messages.push({ text: `${userName}-ն միացավ`, author: '', float: 'center' })
			this.users.push(userName)
			this.scrollMessages();
		})

		socket.on('disConnected', (userName) => {
			let index = this.users.indexOf(userName);
			this.users.splice(index, 1);
			this.messages.push({ text: `${userName}-ն անջատվեց`, author: '', float: 'center' })
			this.scrollMessages();
		})

		socket.on('getMessage', (data) => {
			this.addMessage(data,float='start')
			this.scrollMessages();
		})

		socket.on('getTyping', (userName) => {
			this.write.userName = userName;
			setTimeout(() => {
				this.write.userName = '';
			}, 1500);

		})
	},

	methods: {
		errorAlert:function(){
			swal('Դուք անջատվել եք ցանցից').then(()=>{window.location.assign('/')})
		},
		addMessage:function(data){
			data.type = data.float != 'center' ? 'message' : 'iserinfo' 
			this.messages.push({ text: data.text, author: data.author, float: data.float,type:data.type })
		},
		openNav: function () {
			document.getElementById("sideNavigation").style.width = "250px";
			document.getElementById('sideNavigation').style.borderLeft = '2px solid #dee2e6';
		},
		closeNav:function() {
			document.getElementById('sideNavigation').style.borderLeft = 'none';
			document.getElementById("sideNavigation").style.width = "0";
		  },
		scrollMessages: function () {
			var d = $('.msg_card_body');
			d.animate({ scrollTop: d.prop('scrollHeight') }, 500);
		},
		keymonitor: function (event) {
			if (event.key == 'Enter') { this.send() }
			socket.emit('sendTyping');
		},
		send: function () {
			if (this.$refs.message.value) {
				socket.emit('sendMessage', { text: this.$refs.message.value })
				this.addMessage({ text: this.$refs.message.value, author: this.userName, float: 'end' })
				this.$refs.message.value = '';
				this.$refs.message.focus();
				this.scrollMessages();
			}

			//this.$refs.messages.scrollBy(0,this.$refs.messages.scrollHeight);	
		},

	},

})
