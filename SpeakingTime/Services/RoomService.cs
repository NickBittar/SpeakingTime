using SpeakingTime.Data;
using SpeakingTime.Data.Models;
using SpeakingTime.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using shortid;
using shortid.Configuration;
using Microsoft.EntityFrameworkCore;

namespace SpeakingTime.Services
{
    public class RoomService : IRoomService
    {
        private readonly SpeakingTimeDbContext DbContext;
        public RoomService(SpeakingTimeDbContext context)
        {
            DbContext = context;
        }

        public Message AddMessageToRoom(string roomId, int userId, string text)
        {
            var room = DbContext.Rooms.FirstOrDefault(r => r.RoomId == roomId);
            if(room != null)
            {
                var message = new Message
                {
                    FromUserId = userId,
                    RoomId = room.Id,
                    Text = text,

                    CreatedDateTime = DateTime.UtcNow,
                    UpdatedDateTime = DateTime.UtcNow,
                };
                DbContext.Messages.Add(message);
                DbContext.SaveChanges();
                return message;
            }
            return null;
        }

        public void AddUserToRoom(string roomId, User user)
        {
            var room = DbContext.Rooms
                .Include(r => r.Users)
                .FirstOrDefault(r => r.RoomId == roomId);
            if(room != null)
            {
                // If no one else in room, make owner
                if (room.Users.Count == 0)
                {
                    room.OwnerUserId = user.Id;
                    room.OwnerUser = user;
                }
                // Add to room's user list
                room.Users.Add(user);
            }
            DbContext.SaveChanges();
        }

        public Room CreateRoom(CreateRoomInputModel input)
        {
            // Map input to new room
            var room = new Room
            {
                RoomName = input.RoomName,

                Users = new List<User>(),

                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
            };

            // Generate unique short id for the RoomId
            var shortIdGenerationOptions = new GenerationOptions { Length = 8 };
            do
            {
                room.RoomId = ShortId.Generate(shortIdGenerationOptions);
            } while (DbContext.Rooms.Any(r => r.RoomId == room.RoomId));

            DbContext.Rooms.Add(room);
            DbContext.SaveChanges();
            return room;
        }

        public Room GetRoom(string roomId)
        {
            return DbContext.Rooms
                .Include(r => r.Users)
                .FirstOrDefault(r => r.RoomId == roomId);
        }

        public Room GetRoom(int id)
        {
            return DbContext.Rooms.FirstOrDefault(r => r.Id == id);
        }

        public List<Message> GetRoomChatHistory(int roomId, DateTime time)
        {
            return DbContext.Messages
                .Where(m => m.RoomId == roomId 
                    && m.CreatedDateTime <= time)
                .OrderBy(m => m.CreatedDateTime)
                .ToList();
        }

        public List<Room> GetRooms()
        {
            var rooms = DbContext.Rooms
                .Include(r => r.OwnerUser)
                .Include(r => r.Users)
                .ToList();
            return rooms;
        }
    }
}
