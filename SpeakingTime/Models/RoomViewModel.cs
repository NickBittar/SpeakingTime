using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Models
{
    public class RoomViewModel
    {
        public string RoomId { get; set; }
        public string RoomName { get; set; }
        public List<string> Emotes { get; set; }
    }
}
