using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Models
{
    public class CreateRoomInputModel
    {
        public string RoomName { get; set; }
        public int OwnerUserId { get; set; }
    }
}
