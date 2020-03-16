history.pushState(null, null, document.URL);
let vue = new Vue({
    el: '#app',
    data: { rooms: [],userName:null,searchResult:{visible:false,response:null,name:null}},

    created: function () {

        if (!this.getCookie('userName')) {
            this.inputUserName((result)=>{
                    this.setCookie('userName', result.value, 100)
                    this.userName = result.value;
                    this.getRooms();
            })
        } else {
            this.userName = this.getCookie('userName');
            this.getRooms();
        }
    },
    updated:function(){
        //if(!this.$refs.search.value) {this.searchResult = {visible:false}};	
    },
    methods: {
        search:function(){
            if(this.$refs.search.value){
                fetch(`/search?keyword=${this.$refs.search.value}`)
            .then(res => res.json())
                .then(data => {
                    if(!data.err){
                        this.searchResult = {visible:true,response:data.response,name:this.$refs.search.value}
                    }
                    console.log(data)
                })
            }else{
                this.searchResult = {visible:false};
            }
        
        },
        getRooms: function () {
            fetch('/getrooms')
                .then(res => res.json())
                .then(data => {
                    if(!data.err){
                        if(data.rooms.length){
                            this.rooms = data.rooms;
                        }
                    }
                    console.log(data)
                })
        },
        inputUserName: function (cb) {
            Swal.fire({
                title: 'Մուտքագրեք ձեր օգտանունը',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                confirmButtonText: 'Վերջ',
                confirmButtonColor: '#007bff',
            }).then((result) => {
                if (!result.value) {
                    this.inputUserName()
                } else {
                    cb(result);

                }

            })
        },
        getCookie: function (cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        setCookie: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },

        join: function (roomName) {
            console.log(roomName,this.userName)
            fetch('/room', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomName: roomName,
                    userName: this.userName,
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.err) {
                        window.location.assign(`/room?roomName=${data.roomName}&userName=${data.userName}`)
                    }
                    else{
                        this.inputUserName((result)=>{
                            this.setCookie('userName', result.value, 100);
                            this.userName = result.value;
                            this.join(roomName);
                        });
                        
                    }
                    
                })

     }
    }

})