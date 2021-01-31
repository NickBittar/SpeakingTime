using SpeakingTime.Data.Models;
using SpeakingTime.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Services
{
    interface IUserService
    {
        List<User> GetUsers();
        List<User> GetUsersInRoom(string roomId);
        User GetUser(int id);
        User CreateUser(CreateUserInputModel input);
    }
}
