const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/')));

// #$#$#$#$#$#$#$#$#$#$#$#$#$$#$

let messages = [];
let users = [];
let accounts = [{login: 'admin', password: 'aaa'},
                {login: 'test', password: 'test'},
                {login: 'root', password: 'root'},
                {login: 'user', password: 'user'}];

function usersList(user, id, add, ip, reconnect) {
    if (add === true) {
        users.push({user, id});
        if (reconnect === true) {
            console.log('User reconnected:   ' + user + ' ' + id + " " + ip);
        }
        else {
            console.log('User added:         ' + user + ' ' + id + " " + ip);
        }
    }

    if (add === false) {
        users.splice(users.findIndex(o => o.id === id), 1);
        console.log('User deleted:       ' + user + ' ' + id + " " + ip);
    }

}



io.on('connection', function(socket){
    console.log("Connected:          " + socket.id + ' ' + socket.request.connection.remoteAddress.split(':')[3])

    socket.emit('memory', process.memoryUsage());


    socket.on('register', function (login, password, reconnect) {
        let index = accounts.findIndex(o => o.login === login);
        if (index === -1) {
            socket.emit('login', false);
            console.log('Bad data login >     ' + login + ' ' + socket.request.connection.remoteAddress.split(':')[3]);
            socket.disconnect();
        }
        else {
            if (accounts[index].login === login && accounts[index].password === password) {
                socket.username = login;
                usersList(socket.username, socket.id, true, socket.request.connection.remoteAddress.split(':')[3], reconnect);
                socket.emit('login', true);
                if (messages.length === 0) {
                    socket.emit('message', 'Brak wiadomości na serwerze. Napisz coś ;)', "Server-Info", 0);
                }
                if (!reconnect === true) {
                        var i = 0;
                        for (var prop in messages) {
                            socket.emit('message', messages[i].message, messages[i].login, i + 1);
                            i++;
                        }
                }
            }
        else {
            socket.emit('login', false);
            console.log('Bad data login >     ' + login + ' ' + socket.request.connection.remoteAddress.split(':')[3]);
            socket.disconnect();
        }}

    });

    socket.on('message', function (message) {
        var login = socket.username;
        messages.push({message, login});
        io.emit('message', message, login, messages.length);

        console.log("Mess: " + login.slice(0, 11).padEnd(11, ' ') + ' > ' + message);
    });

    socket.on('is typing', function (data) {
            socket.broadcast.emit('is typing', {typing: data.boolean, username: socket.username});
    });

    socket.on('disconnect', function () {
       
        if (socket.username !== undefined) {
            usersList(socket.username, socket.id, false, socket.request.connection.remoteAddress.split(':')[3]);
        }
        else {
            console.log("Disconnected:       " + socket.username + ' ' + socket.id + ' ' + socket.request.connection.remoteAddress.split(':')[3]);
        }
    })
});

http.listen(port, function(){
    console.log('listening on        *:%d', port);
});