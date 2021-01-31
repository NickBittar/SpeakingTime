using Microsoft.EntityFrameworkCore;
using SpeakingTime.Data;
using SpeakingTime.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Services
{
    public class ConnectionService : IConnectionService
    {
        private readonly SpeakingTimeDbContext DbContext;
        public ConnectionService(SpeakingTimeDbContext context)
        {
            DbContext = context;
        }

        public Connection AddConnection(User user, Room room, string connectionId)
        {
            var connection = new Connection
            {
                ConnectionId = connectionId,
                UserId = user.Id,
                RoomId = room.Id,

                User = user,
                Room = room,

                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
            };

            DbContext.Connections.Add(connection);

            DbContext.SaveChanges();

            return connection;
        }

        public Connection GetConnection(string connectionId)
        {
            var connection = DbContext.Connections
                .Include(c => c.Room)
                .FirstOrDefault(c => c.ConnectionId == connectionId);

            return connection;
        }

        public List<Connection> GetConnections(bool getDeleted = false)
        {
            var connections = DbContext.Connections
                .Include(c => c.User)
                .Include(c => c.Room)
                .Where(c => (getDeleted || c.DeletedDateTime == null))
                .ToList();

            return connections;
        }

        public List<Connection> GetRoomConnections(string roomId, bool getDeleted = false)
        {
            var connections = DbContext.Connections
                .Include(c => c.User)
                .Include(c => c.Room)
                .Where(c => c.Room.RoomId == roomId && (getDeleted || c.DeletedDateTime == null))
                .ToList();

            return connections;
        }

        public Connection RemoveConnection(int id)
        {
            var connection = DbContext.Connections
                .Include(c => c.Room)
                .FirstOrDefault(c => c.Id == id);

            RemoveConnection(connection);

            return connection;
        }

        public Connection RemoveConnection(string connectionId)
        {
            var connection = DbContext.Connections
                .Include(c => c.Room)
                .FirstOrDefault(c => c.ConnectionId == connectionId);

            RemoveConnection(connection);

            return connection;
        }

        private void RemoveConnection(Connection connection)
        {
            if (connection != null)
            {
                connection.UpdatedDateTime = DateTime.UtcNow;
                connection.DeletedDateTime = DateTime.UtcNow;
                DbContext.SaveChanges();
            }
        }
    }
}
