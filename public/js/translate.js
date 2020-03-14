  $(function() {
  		$('.translate').click(function() {
       	let lang = $(this).attr('id');
        document.cookie = `lang=${lang};path=/`; 
     	$('.lang').each(function(index, item) {$(this).attr('placeholder',arrLang[lang][$(this).attr('key')]);$(this).text(arrLang[lang][$(this).attr('key')]);})
        });
		
  		function getCookie(cname) {var name = cname + "=";var ca = document.cookie.split(';');for(var i = 0; i < ca.length; i++) {var c = ca[i];while (c.charAt(0) == ' ') {c = c.substring(1);}if (c.indexOf(name) == 0) {return c.substring(name.length, c.length);} }return "";}
		var lang = getCookie('lang');

		if(lang == '' || lang == undefined || lang == null){
			lang = 'hy';
		}
		$('.lang').each(function(index, item) {$(this).attr('placeholder',arrLang[lang][$(this).attr('key')]);$(this).text(arrLang[lang][$(this).attr('key')]);})
		

   
    });