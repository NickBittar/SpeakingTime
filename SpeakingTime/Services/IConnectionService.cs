using SpeakingTime.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Services
{
    public interface IConnectionService
    {
        Connection AddConnection(User user, Room room, string connectionId);
        Connection RemoveConnection(int id);
        Connection RemoveConnection(string connectionId);
        Connection GetConnection(string connectionId);
        List<Connection> GetConnections(bool getDeleted = false);
        List<Connection> GetRoomConnections(string roomId, bool getDeleted = false);
        bool CheckIfUserAlreadyConnected(string roomId, int userId);
    }
}
