using SpeakingTime.Data.Models;
using SpeakingTime.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Services
{
    public interface IRoomService
    {
        List<Room> GetRooms();
        Room GetRoom(string roomId);
        Room GetRoom(int id);
        Room CreateRoom(CreateRoomInputModel input);
        void AddUserToRoom(string roomId, User user);
        Message AddMessageToRoom(string roomId, int userId, string text);
        List<Message> GetRoomChatHistory(int roomId, DateTime time);
    }
}
