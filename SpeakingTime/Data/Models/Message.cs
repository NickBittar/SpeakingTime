using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Data.Models
{
    public class Message : Entity
    {
        public int FromUserId { get; set; }
        public int RoomId { get; set; }
        public string Text { get; set; }

        public User FromUser { get; set; }
        public Room Room { get; set; }
    }
}
