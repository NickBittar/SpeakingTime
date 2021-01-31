using SpeakingTime.Data;
using SpeakingTime.Data.Models;
using SpeakingTime.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Services
{
    public class UserService : IUserService
    {
        private readonly SpeakingTimeDbContext DbContext;
        public UserService(SpeakingTimeDbContext context)
        {
            DbContext = context;
        }

        public User CreateUser(CreateUserInputModel input)
        {
            var user = new User
            {
                Name = input.Name,
                Color = input.Color,

                CreatedDateTime = DateTime.UtcNow,
                UpdatedDateTime = DateTime.UtcNow,
            };
            DbContext.Users.Add(user);

            DbContext.SaveChanges();

            return user;
        }

        public User GetUser(int id)
        {
            return DbContext.Users.Find(id);
        }

        public List<User> GetUsers()
        {
            return DbContext.Users.ToList();
        }

        public List<User> GetUsersInRoom(string roomId)
        {
            var room = DbContext.Rooms
                .FirstOrDefault(r => r.RoomId == roomId);
            if(room != null)
            {
                return room.Users;
            }
            else
            {
                return new List<User>();
            }
        }
    }
}
