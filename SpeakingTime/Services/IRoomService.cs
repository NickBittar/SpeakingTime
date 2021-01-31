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
        Room CreateRoom(CreateRoomInputModel input);
    }
}
