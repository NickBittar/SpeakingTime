using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Data.Models
{
    public class Room : Entity
    {
        public string RoomId { get; set; }
        public string RoomName { get; set; }
        public int OwnerUserId { get; set; }

        public int? CurrentSpeakerUserId { get; set; }
        public DateTime? CurrentSpeakerEndTime { get; set; }

        public User OwnerUser { get; set; }
        public List<User> Users { get; set; }
    }
}
