// Html Elements
const roomUserList = document.getElementById('room-user-list');
const chatMessagesContainer = document.getElementById('chat-messages');
const emotesMenu = document.getElementById('emotes-menu');
const chatTextBox = document.getElementById('chat-text-box');
const chatTextBoxEmoteBtn = document.getElementById('chat-text-box-emote-btn');

// Html Templates
const userListItemTemplate = document.getElementById('user-list-item-template').firstElementChild;
const chatMessageTemplate = document.getElementById('chat-message-template').firstElementChild;
const chatSignalTemplate = document.getElementById('chat-signal-template').firstElementChild;


// User list
let users = [];
let currentUser = null;

// Get emotes
const emotes = [...emotesMenu.querySelectorAll('.emote')].map(elem => elem.innerText);
const emoteRegex = new RegExp('\\b(' + emotes.join('|') + ')\\b', 'g');

const roomId = document.getElementById('room-id').value;
const existingUserId = parseInt(localStorage.getItem('userId_' + roomId));

let connection = null;

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
    let message = chatTextBox.value.trim().replace(/\s+/g, ' ');
    if (message !== '') {
        connection.invoke('SendMessage', currentUser.id, message).then(function () {
            chatTextBox.value = '';
        }).catch(function (err) {
            return console.error(err.toString());
        });
    }
    // hide emote menu
    toggleEmotesMenu(false);
    chatTextBoxEmoteBtn.classList.add('btn-outline-secondary');
    chatTextBoxEmoteBtn.classList.remove('btn-secondary');
    emotesMenu.classList.add('hidden');
}

function addTextToChatBox(text) {
    chatTextBox.focus();
    const selectionStart = chatTextBox.selectionStart;
    const selectionEnd = chatTextBox.selectionEnd;
    let messageStart = chatTextBox.value.substr(0, selectionStart).trimEnd();
    if (messageStart.length > 0) {
        messageStart += ' ';
    }
    let messageEnd = ' ' + chatTextBox.value.substr(selectionEnd).trimStart();
    const message = messageStart + text + messageEnd;
    chatTextBox.value = message;
    const cursorPosition = (messageStart + text + ' ').length;
    chatTextBox.selectionStart = cursorPosition;
    chatTextBox.selectionEnd = cursorPosition;
}

function toggleEmotesMenu(showMenu) {
    if (showMenu === true) {
        emotesMenu.classList.remove('hidden');
    } else if (showMenu === false) {
        emotesMenu.classList.add('hidden');
    } else {
        emotesMenu.classList.toggle('hidden');
    }
    if (emotesMenu.classList.contains('hidden')) {
        chatTextBoxEmoteBtn.classList.add('btn-outline-secondary');
        chatTextBoxEmoteBtn.classList.remove('btn-secondary');
    } else {
        chatTextBoxEmoteBtn.classList.add('btn-secondary');
        chatTextBoxEmoteBtn.classList.remove('btn-outline-secondary');
    }
}

function convertAnyEmotes(message) {
    return message.replace(emoteRegex, '<span class="emote $1" title="$1">$1</span>');
}

const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
};
// Regex containing the keys listed immediately above.
const htmlEscaper = /[&<>"'\/]/g;

// Escape a string for HTML interpolation.
function htmlEscape(string) {
    return ('' + string).replace(htmlEscaper, function (match) {
        return htmlEscapes[match];
    });
}

// EVENT LISTENERS
document.getElementById('create-user-btn').addEventListener('click', function (e) {
    e.preventDefault();
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

chatTextBox.addEventListener('keypress', function (e) {
    if (e.keyCode === 13) {
        sendChatMessage();
    }
});
document.getElementById('chat-text-box-send-btn').addEventListener('click', sendChatMessage);
chatTextBoxEmoteBtn.addEventListener('click', toggleEmotesMenu);
emotesMenu.addEventListener('click', function (e) {
    if (e.target.classList.contains('emote')) {
        const emoteName = e.target.innerText;
        addTextToChatBox(emoteName);
    }
});

// WEBSOCKETS
// Initiate Connection
function InitiateConnection(user, roomId) {
    connection = new signalR.HubConnectionBuilder().withUrl('/roomhub').build();
    addConnectionListeners();
    connection.start().then(function () {
        // Send user info for room
        connection.invoke('JoinRoom', user, roomId).then(function (response) {
            if (response.success) {
                
            } else {
                console.error(response.toString());

                document.getElementById('error').classList.remove('hidden');
                //// Unlock form
                //document.getElementById('user-name-input').removeAttribute('disabled');
                //document.getElementById('user-color-input').removeAttribute('disabled');
                //document.getElementById('create-user-btn').removeAttribute('disabled');
                //document.getElementById('create-user').classList.remove('hidden');
            }
        });
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

function addConnectionListeners() {
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
        chatMessage.querySelector('.chat-message-text').innerHTML = convertAnyEmotes(htmlEscape(message));
        chatMessagesContainer.prepend(chatMessage);
    });
}