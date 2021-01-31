using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Models
{
    public class JoinRoomInputModel : CreateUserInputModel
    {
        public string RoomId { get; set; }
    }
}
