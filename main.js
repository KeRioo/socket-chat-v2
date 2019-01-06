    $('#login').focus();





    var $register = $('.register');
    var $chat = $('.chat');
    var $input_window = $('.input');

    var $message = $('.message-list');
    var $input = $('#input');
    var $memory = $('.memory-usage');
    let login, password;
    $input.val('');

    var socket = io();

    //ASDASDASDASDASDASDASDASDASDASD START LOGIN
    function register(login, password, reconnect) {
        socket.emit('register', login, password, reconnect);
    }

    function showChat() {

        $register.fadeOut("slow");
        $memory.fadeOut("slow");

        $chat.fadeIn("slow");
        $input_window.fadeIn("slow");
        $('#input').focus();


    }
    $('#password').on( "keydown", function(event) {
        if(event.which == 13) {
            event.preventDefault();
            login = $('#login').val().trim();
            password = $('#password').val().trim();
            register(login, password);
        }
    });

    socket.on('login', function (bool) {
        if (bool === true) {
            showChat();
            console.log("Zalogowano na konto: " + login);
        }
        if (bool === false){
            alert("Złe dane logowania");
            location.reload(false);
        }
    });
    //ASDASDASDASDASDASDASDASDASDASDAS END LOGIN


    //ASDASDASDASDASDASDASDASDASDASDAS START PRINT MESSAGE
    function log(message, login, id) {

        let el = $('<div>').text(message).addClass('left-mes').attr('id', id + 'mess');
        let pseudo = $('<div>').text(login).addClass('left-mes-login').attr('id', id + 'login');
        let beforeLogin = $('.left-mes-login[id="'+(id-1)+'login"]').text();

        if (beforeLogin !== login) {
            $message.append(pseudo);
            let $pseudo = $message.children().last();
            $pseudo.fadeIn("slow").css({left: '0', bottom: '0'});
        }
        else {
            $message.append(pseudo);
            let $pseudo = $message.children().last();
            $pseudo.fadeIn("slow").css({left: '0', bottom: '0', display: 'none'});
        }
        $message.append(el);
        let $el = $message.children().last();
        $el.fadeIn("slow").css({left: '0', bottom: '0'});


        $message.scrollTop($message[0].scrollHeight);

    }
    //ASDASDASDASDASDASDASDASDASDASDAS END PRINT MESSAGE

    var typing = false;
    var timeout = undefined;

    function isTypingTimeout(){
        typing = false;
        socket.emit('is typing', {boolean: false});
    }

    function isTyping(){
        if(typing === false) {
            typing = true
            socket.emit('is typing', {boolean: true});
            timeout = setTimeout(isTypingTimeout, 1000);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(isTypingTimeout, 1000);
        }

    }
    const getTypingMessages = (login) => {
        return $('.typing').filter(function () {
            console.log($(this).text());
            return $(this).attr("login") === login;
        });
    };

    socket.on('is typing', function(data) {
        if (data.typing) {
            let mess = $('<div>').text(data.username + ' pisze wiadomość...').addClass('typing').attr("login", data.username);
            $message.append(mess).fadeIn();
        }
        if (!data.typing) {
            getTypingMessages(data.username).fadeOut(function () {
                $(this).remove();
            });
        }
    });

    $input.on('keydown focus', function(event) {
        isTyping();
        if (event.keyCode === 13) {
            if (!event.shiftKey) {
                var message = $input.val().trim();
                if (message !== '') {
                    socket.emit('message', message);
                    $input.focus();
                    $input.val('');
                }
                $input.val('');
                $input.focus();
            }
        }
    });

    socket.on('message', function (message, login, id) {
        log(message, login, id);
    });
    socket.on('reconnect', function () {
        register(login,password, true);
    });

