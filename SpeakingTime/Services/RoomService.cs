﻿using SpeakingTime.Data;
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

        public void AddUserToRoom(string roomId, User user)
        {
            var room = DbContext.Rooms
                .Include(r => r.Users)
                .FirstOrDefault(r => r.RoomId == roomId);
            if(room != null)
            {
                room.Users.Add(user);
            }
            DbContext.SaveChanges();
        }

        public Room CreateRoom(CreateRoomInputModel input)
        {
            // Create User
            var user = new User
            {
                Name = input.UserName,
                Color = input.UserColor,

                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
            };
            DbContext.Users.Add(user);

            DbContext.SaveChanges();

            // Map input to new room
            var room = new Room
            {
                RoomName = input.RoomName,
                OwnerUserId = user.Id,
                OwnerUser = user,
                Users = new List<User> { user },

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