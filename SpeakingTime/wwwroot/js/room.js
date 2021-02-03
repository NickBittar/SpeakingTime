﻿// EVENT LISTENERS
document.getElementById('create-user-btn').addEventListener('click', function () {
        
        const nameInput = document.getElementById('user-name-input');
        const colorInput = document.getElementById('user-color-input');
        let user = {
            Name: nameInput.value?.trim(),
            Color: colorInput?.value,
        };
        if (user.Name === undefined || user.Name === null || user.Name === '') {
            return false;
        }
        if (user.Color === undefined || user.Color === null || user.Color === '') {
            return false;
        }

        // Lock form
        nameInput.setAttribute('disabled', '');
        colorInput.setAttribute('disabled', '');
        this.setAttribute('disabled', '');

        InitiateConnection(user, roomId);
    });
document.getElementById('reload-room-btn').addEventListener('click', function () {
    window.location.reload();
});
document.getElementById('leave-room-btn').addEventListener('click', function () {
    localStorage.removeItem('userId_' + roomId);
    window.location.reload();
});

document.getElementById('chat-text-box').addEventListener('keypress', function (e) {
    if (e.keyCode === 13) {
        sendChatMessage();
    }
});
document.getElementById('chat-text-box-btn').addEventListener('click', sendChatMessage);

// User list
let users = [];

let currentUser = null;

// Setup Connection to hub
const connection = new signalR.HubConnectionBuilder().withUrl('/roomhub').build();

const roomUserList = document.getElementById('room-user-list');
const chatMessagesContainer = document.getElementById('chat-messages');
const userListItemTemplate = document.getElementById('user-list-item-template').firstElementChild;
const chatMessageTemplate = document.getElementById('chat-message-template').firstElementChild;
const chatSignalTemplate = document.getElementById('chat-signal-template').firstElementChild;

const roomId = document.getElementById('room-id').value;
const existingUserId = parseInt(localStorage.getItem('userId_' + roomId));


init();

function init() {
    // Check to see if user was already in room
    if (existingUserId) {
        InitiateConnection({ id: existingUserId }, roomId);
    } else {
        document.getElementById('create-user').classList.remove('hidden');
    }
}


function createUserList() {
    roomUserList.innerHTML = '';
    for (let user of users) {
        addUserToUserList(user);
    }
}

function addUserToUserList(user) {
    let userListItem = userListItemTemplate.cloneNode(true);
    userListItem.id = 'user-list-item-' + user.id;
    userListItem.querySelector('.user-list-item-name').textContent = user.name;
    userListItem.style.borderLeft = '10px solid ' + user.color;
    if (user.id === currentUser.id) {
        userListItem.classList.add('current-user');
    }
    roomUserList.appendChild(userListItem);
}
function removeUserFromUserList(userId) {
    document.getElementById('user-list-item-' + userId).remove();
}

function sendChatMessage() {
    let message = document.getElementById('chat-text-box').value.trim();
    if (message !== '') {
        connection.invoke('SendMessage', currentUser.id, message).then(function () {
            document.getElementById('chat-text-box').value = '';
        }).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

// WEBSOCKETS
// Initiate Connection
function InitiateConnection(user, roomId) {
    connection.start().then(function () {
        // Send user info for room
        connection.invoke('JoinRoom', user, roomId).catch(function (err) {
            return console.error(err.toString());
        });
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

connection.on('UserList', function (_users) {
    console.log(_users);
    users = _users;
    createUserList();
});

connection.on('AllowedIn', function (user) {
    localStorage.setItem('userId_' + roomId, user.id);
    currentUser = user;

    // hide user form
    document.getElementById('create-user').classList.add('hidden');

    // show main room
    document.getElementById('room').classList.remove('hidden');
});

connection.on('UserJoin', function (response) {
    console.log(response);
    users.push(response.user);
    addUserToUserList(response.user);

    const chatSignal = chatSignalTemplate.cloneNode(true);
    chatSignal.querySelector('.chat-message-signal-text').textContent = response.user.name;
    chatSignal.querySelector('.chat-message-signal-text').style.backgroundColor = response.user.color;
    chatSignal.querySelector('.chat-message-signal-text').textContent = response.user.name + ' has joined';
    chatMessagesContainer.prepend(chatSignal);
});

connection.on('UserLeave', function (userId) {
    console.log(userId, ' left');
    const user = users.filter(u => u.id === userId)[0];
    users = users.filter(u => u.id !== userId);
    removeUserFromUserList(userId);


    const chatSignal = chatSignalTemplate.cloneNode(true);
    chatSignal.querySelector('.chat-message-signal-text').textContent = user.name;
    chatSignal.querySelector('.chat-message-signal-text').style.backgroundColor = user.color;
    chatSignal.querySelector('.chat-message-signal-text').textContent = user.name + ' has left';
    chatMessagesContainer.prepend(chatSignal);
});

connection.on('ReceiveMessage', function (userId, message) {
    console.log(userId, message);
    const chatMessage = chatMessageTemplate.cloneNode(true);
    chatMessage.querySelector('.chat-message-user').textContent = users.filter(u => u.id === userId)[0].name;
    chatMessage.querySelector('.chat-message-user').style.backgroundColor = users.filter(u => u.id === userId)[0].color;
    chatMessage.querySelector('.chat-message-text').textContent = message;
    chatMessagesContainer.prepend(chatMessage);
});