using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Data.Models
{
    public class Connection : Entity
    {
        public string ConnectionId { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }

        public User User { get; set; }
        public Room Room { get; set; }
    }
}
