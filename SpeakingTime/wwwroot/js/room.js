document.getElementById('create-user-btn')
    .addEventListener('click', function () {
        
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

// User list
let users = [];

// Setup Connection to hub
var connection = new signalR.HubConnectionBuilder().withUrl('/roomhub').build();

const roomUserList = document.getElementById('room-user-list');
const userListItemTemplate = document.getElementById('user-list-item-template').firstElementChild;

const roomId = document.getElementById('room-id').value;
const existingUserId = parseInt(localStorage.getItem('userId_' + roomId));

if (existingUserId) {
    InitiateConnection({ id: existingUserId }, roomId);
} else {
    document.getElementById('create-user').classList.remove('hidden');
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
    roomUserList.appendChild(userListItem);
}
function removeUserFromUserList(userId) {
    document.getElementById('user-list-item-' + userId).remove();
}

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

    // hide user form
    document.getElementById('create-user').classList.add('hidden');

    // show main room
    document.getElementById('room').classList.remove('hidden');
});

connection.on('UserJoin', function (response) {
    console.log(response);
    users.push(response.user);
    addUserToUserList(response.user);
});

connection.on('UserLeave', function (userId) {
    console.log(userId, ' left');
    users = users.filter(u => u.id !== userId);
    removeUserFromUserList(userId);
});

connection.on('ReceiveMessage', function (user, message) {
    console.log(user, message);
});