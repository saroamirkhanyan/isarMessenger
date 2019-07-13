$(document).ready(()=>{ 
	var socket = io({transports: ['websocket'], upgrade: true});
	socket.emit('join_room',room,name)
	socket.on('joined',(name)=>{
		$('#users').append(`<div class="d-flex bd-highlight"><div class="user_info"><span id=${name}>${name}</span><hr></div></div> `)
	})
	$('#send').click(()=>{
		var text = $('#message').val();
		if(text == ''){}
		else{
		var time = new Date();
		var hours = time.getHours();
		var minutes = time.getMinutes();
		$('.msg_card_body').append(`<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer">${text}<span class="msg_time">${hours}:${minutes} , You</span></div></div>`)
		socket.emit('message',name,$('#message').val())
		$('#message').val('')
		var d = $('.msg_card_body');
		d.scrollTop(d.prop("scrollHeight"));$(".msg_card_body").animate({ scrollTop: $('.msg_card_body').prop("scrollHeight")}, 1000);
		}		
	})
	socket.on('message',(name,message)=>{ 
		var time = new Date();
		var hours = time.getHours();
		var minutes = time.getMinutes();
		$('.msg_card_body').append(`<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">${message}<span class="msg_time">${hours}:${minutes} , ${name}</span></div></div>`)
		var d = $('.msg_card_body');
		d.scrollTop(d.prop("scrollHeight"));$(".msg_card_body").animate({ scrollTop: $('.msg_card_body').prop("scrollHeight")}, 1000);
	})
	socket.on('disconn',(name)=>{$(`#${name}`).parent().parent().remove()})
	$('input').keypress((e)=>{if(e.charCode == 13){$('#send').click()}
	})
	
})