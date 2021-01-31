document.getElementById('create-user-btn')
    .addEventListener('click', function () {
        const roomId = document.getElementById('room-id').value;
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

let users = [];

// Setup Connection to hub
var connection = new signalR.HubConnectionBuilder().withUrl('/roomhub').build();

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
});

connection.on('AllowedIn', function () {
    // hide user form
    document.getElementById('create-user').classList.add('hidden');

    // show main room
    document.getElementById('room').classList.remove('hidden');
});

connection.on('UserJoin', function (response) {
    console.log(response);
    users.push.response.user;
});

connection.on('UserLeave', function (userId) {
    console.log(userId, ' left');
    users = users.filter(u => u.Id !== userId);
});

connection.on('ReceiveMessage', function (user, message) {
    console.log(user, message);
});