using SpeakingTime.Data;
using SpeakingTime.Data.Models;
using SpeakingTime.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using shortid;
using shortid.Configuration;

namespace SpeakingTime.Services
{
    public class RoomService : IRoomService
    {
        private readonly SpeakingTimeDbContext DbContext;
        public RoomService(SpeakingTimeDbContext context)
        {
            DbContext = context;
        }
        public Room CreateRoom(CreateRoomInputModel input)
        {
            // Map input to new room
            var room = new Room
            {
                RoomName = input.RoomName,
                OwnerUserId = input.OwnerUserId,
            };

            // Generate unique short id for the RoomId
            var shortIdGenerationOptions = new GenerationOptions { Length = 8 };
            do
            {
                room.RoomId = ShortId.Generate(shortIdGenerationOptions);
            } while (DbContext.Rooms.Any(r => r.RoomId == room.RoomId));

            DbContext.Rooms.Add(room);

            return room;
        }

        public Room GetRoom(string roomId)
        {
            return DbContext.Rooms.FirstOrDefault(r => r.RoomId == roomId);
        }

        public List<Room> GetRooms()
        {
            return DbContext.Rooms.ToList();
        }
    }
}
