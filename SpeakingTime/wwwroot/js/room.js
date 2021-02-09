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
let allRoomUsers = [];
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
    userListItem.setAttribute('data-user-id', user.id);
    userListItem.querySelector('.make-speaker-btn').setAttribute('data-user-id', user.id);
    userListItem.querySelector('.make-speaker-btn').addEventListener('click', () => makeSpeakerBtnClick(user.id));
    roomUserList.appendChild(userListItem);
}
function removeUserFromUserList(userId) {
    document.getElementById('user-list-item-' + userId).remove();
}

function sendChatMessage() {
    let message = chatTextBox.value.trim().replace(/\s+/g, ' ');
    if (message !== '') {
        connection.invoke('SendMessage', roomId, currentUser.id, message).then(function () {
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

function addMessage(message, oldMessage = false) {
    const chatMessage = chatMessageTemplate.cloneNode(true);
    chatMessage.querySelector('.chat-message-user').textContent = allRoomUsers.filter(u => u.id === message.fromUserId)[0].name;
    chatMessage.querySelector('.chat-message-user').style.backgroundColor = allRoomUsers.filter(u => u.id === message.fromUserId)[0].color;
    chatMessage.querySelector('.chat-message-text').innerHTML = convertAnyEmotes(htmlEscape(message.text));
    if (oldMessage) {
        chatMessagesContainer.append(chatMessage);
    } else {
        chatMessagesContainer.prepend(chatMessage);
    }
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

const currentSpeakerTimer = {
    currentInterval: null,
    updateTimeRemaining: function (elem, endTime, alwaysDisplayHours) {
        const secondsRemaining = Math.round((endTime - new Date()) / 1000);
        if (secondsRemaining < 0) {
            currentSpeakerTimer.stopCurrentCountdown();
            return;
        }
        elem.textContent = convertSecondsToTime(Math.max(0, secondsRemaining), alwaysDisplayHours);
    },
    stopCurrentCountdown: function() {
        clearInterval(currentSpeakerTimer.currentInterval);
        currentSpeakerTimer.currentInterval = null;
    },
    countDownTimeRemaining: function(elem, endTime) {
        if (currentSpeakerTimer.currentInterval !== null) {
            currentSpeakerTimer.stopCurrentCountdown();
        }
        const alwaysDisplayHours = ( (endTime - new Date()) / (1000 * 60 * 60) >= 1 );
        currentSpeakerTimer.updateTimeRemaining(elem, endTime, alwaysDisplayHours);
        currentSpeakerTimer.currentInterval = setInterval(function () {
            currentSpeakerTimer.updateTimeRemaining(elem, endTime, alwaysDisplayHours);
        }, 1000);
    },
};


function convertSecondsToTime(seconds, displayHours = null) {
    let hour = seconds / (60 * 60);
    let min = (hour - Math.floor(hour)) * 60;
    let sec = (min - Math.floor(min)) * 60;
    hour = Math.floor(hour);
    min = Math.floor(min);
    sec = Math.floor(sec);
    let timeString = '';
    if (hour > 0 || displayHours === true) {
        timeString = hour.toString() + ':' + min.toString().padStart(2, '0') + ':';
    } else {
        timeString += min.toString() + ':';
    }
    timeString += sec.toString().padStart(2, '0');
    return timeString;
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
function makeSpeakerBtnClick(userId) {
    connection.invoke('MakeSpeaker', roomId, userId, 10).then(function () {
        
    }).catch(function (err) {
        return console.error(err.toString());
    });
}

// WEBSOCKETS
// Initiate Connection
function InitiateConnection(user, roomId) {
    connection = new signalR.HubConnectionBuilder().withUrl('/roomhub').build();
    addConnectionListeners();
    connection.start().then(function () {
        // Send user info for room
        connection.invoke('JoinRoom', user, roomId).then(function (response) {
            if (response.success) {
                if (response.chatHistory.length === 0) {
                    chatMessagesContainer.querySelector('.divider.new-messages-line').remove();
                } else {
                    for (let message of response.chatHistory) {
                        addMessage(message, true);
                    }
                }
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
    connection.on('UserList', function (userList) {
        console.log(userList);
        users = userList;
        createUserList();
    });
    connection.on('AllUsersList', function (allUsersList) {
        console.log(allUsersList);
        allRoomUsers = allUsersList;
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
        if (allRoomUsers.filter(u => u.id === response.user.id).length === 0) {
            allRoomUsers.push(response.user);
        }
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

    connection.on('ReceiveMessage', function (message) {
        console.log(message);
        addMessage(message);
    });

    connection.on('NewSpeaker', function (response) {
        console.log(arguments);
        const newSpeakerElem = document.getElementById('current-speaker');
        const user = allRoomUsers.filter(u => u.id === response.userId)[0];
        newSpeakerElem.querySelector('.current-speaker-name').textContent = user.name;
        if (response.endTime !== null) {
            currentSpeakerTimer.countDownTimeRemaining(newSpeakerElem.querySelector('.current-speaker-time-remaining'), new Date(response.endTime));
        }
        newSpeakerElem.style.borderColor = user.color;
    });
}