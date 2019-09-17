	function escapeHtml(text) {let map = {'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#039;'};return text.replace(/[&<>"']/g, function(m) { return map[m]; });}
	function getCookie(cname) {var name = cname + "=";var ca = document.cookie.split(';');for(var i = 0; i < ca.length; i++) {var c = ca[i];while (c.charAt(0) == ' ') {c = c.substring(1);}if (c.indexOf(name) == 0) {return c.substring(name.length, c.length);} }return "";}
	alerttime = (hours,minutes,username) =>{if(minutes<10){minutes = '0' + minutes;}if(hours<10){hours = '0' + hours;};
		const lang = getCookie('lang');
		switch(lang){
			case '':
			swal(`Message sent ${hours}:${minutes} by ${username} ` )
			break
			case 'hy':
			swal(`Նամակը ուղարկվել է ${hours}:${minutes} - ին   ${username}-ի կողմից ` )
			break
			case 'en':
			swal(`Message sent ${hours}:${minutes} by ${username} ` )
			break
			case 'ru':
			swal(`Письмо отправлено ${hours}:${minutes} от ${username} ` )
		}

	
}
	$(document).ready(()=>{
		if ($(document).width() < 768) {
			$('.card').css('height',document.body.clientHeight-2+ 'px')
			$('.pc_chat').css('height',document.body.clientHeight-2+ 'px')
		}else{
			$('.card').css('height','70vh')
			$('.pc_chat').css('height', '80vh')
		}
		$(window).on('resize',()=> {
		let height =document.body.clientHeight;
  		if ($(document).width() < 768) {
  		$('.card').css('height',height-2+ 'px')
  		$('.pc_chat').css('height',height-2+ 'px')
  		}else{
  			$('.card').css('height','70vh')
  			$('.pc_chat').css('height', '80vh')
  		}
		});


		function scrollMessages(){$(".messages").scrollTop($(".msg_card_body").prop("scrollHeight"));$(".msg_card_body").animate({ scrollTop: $('.msg_card_body').prop("scrollHeight")}, 1000);}
		function con_disconn(name,text){	

			$('.messages').append(`<p class='text-center'>${name} ${text}</p>`);
			scrollMessages();


			if(text == 'Joined' || text == '-ն մուտք գործեց'){
				$('.users_list').append(`<div class="d-flex bd-highlight" id='${name}'><div class="user_info"><span>${name}</span><hr></div></div>`)}
				else{$(`#${name}`).remove();$(`#${name}`).remove()
			}

		}
		









		function send_message(name,message,pos){var time = new Date();var hours = time.getHours();var minutes = time.getMinutes();$('.messages').append(`<div class="d-flex justify-content-${pos} mb-4" onclick="alerttime(${hours},${minutes},'${name}')"><div class="msg_cotainer"><p>${message}</p><span class="msg_time">${name}</span></div></div>`);scrollMessages()}
		
		var socket = io.connect();	
		socket.emit('join_room',room,name);
		socket.on('joined_user',(name)=>{
			const lang = getCookie('lang'); 
			switch(lang){
				case 'hy':	
					con_disconn(name,'-ն մուտք գործեց');
				break
				case 'en':
					con_disconn(name,'logged in');
				break
				case 'ru':
					con_disconn(name,'вошли в систему');
				break
				case '':
					con_disconn(name,'logged in');
				break
						}

		})
		socket.on('disconnected',(name)=>{
			const lang = getCookie('lang'); 
			switch(lang){
				case 'hy':	
					con_disconn(name,'-ն դուրս եկավ');
				break
				case 'en':
					con_disconn(name,'went out');
				break
				case 'ru':
					con_disconn(name,'вышел');
				break
				case '':
					con_disconn(name,'went out');
				break
			}
		})
		$('#send_message').click(()=>{let message = escapeHtml($('#message').val()); if(message == ''){}else {socket.emit('message',name,message);send_message(name,message,'end');$('#message').val('');$('#message').focus();scrollMessages();}})
		$('input').keypress((e)=>{if(e.charCode == 13){$('#send_message').click()}})
		socket.on('message',(name,message)=>{send_message(name,message,'start');scrollMessages()});
		$('#message').on('input',()=>{socket.emit('typing',name)})
		socket.on('typing',(name)=>{
			const lang = getCookie('lang');
			$('.write').show();
			switch(lang){
				case 'hy':
				$('.write').text(`${name} գրում է`)
				break
				case 'en':
				$('.write').text(`${name} write`)
				break
				case 'ru':
				$('.write').text(`${name} пишет `)
				break
				case '':
				$('.write').text(`${name} write`)
				break
			}
		
			setTimeout(() =>{$('.write').text('');$('.write').hide()},2000);
		})
	

	})

	

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
