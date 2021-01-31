using Microsoft.AspNetCore.SignalR;
using SpeakingTime.Models;
using SpeakingTime.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Hubs
{
    public class RoomHub : Hub
    {
        private readonly IRoomService _roomService;
        private readonly IUserService _userService;
        private readonly IConnectionService _connectionService;
        public RoomHub(IRoomService roomService, IUserService userService, IConnectionService connectionService)
        {
            _roomService = roomService;
            _userService = userService;
            _connectionService = connectionService;
        }

        public async Task JoinRoom(CreateUserInputModel user, string roomId)
        {
            // Create user and add to room
            var userEntity = _userService.CreateUser(user);
            _roomService.AddUserToRoom(roomId, userEntity);
            // Add connection
            var room = _roomService.GetRoom(roomId);
            _connectionService.AddConnection(userEntity, room, Context.ConnectionId);
            var connections = _connectionService.GetRoomConnections(roomId);

            await Clients.Group(roomId).SendAsync("UserJoin", new { User = userEntity });
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Caller.SendAsync("AllowedIn");
            await Clients.Caller.SendAsync("UserList", connections.Select(c => c.User).ToList());
        }
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var connection = _connectionService.RemoveConnection(Context.ConnectionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connection.Room.RoomId);
            await Clients.Group(connection.Room.RoomId).SendAsync("UserLeave", connection.UserId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
