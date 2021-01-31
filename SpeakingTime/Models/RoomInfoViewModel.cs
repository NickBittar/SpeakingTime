using SpeakingTime.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Models
{
    public class RoomInfoViewModel
    {
        public Room Room { get; set; }
        public List<User> Users { get; set; }
        public List<Connection> Connections { get; set; }
    }
}
