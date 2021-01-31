using Microsoft.AspNetCore.Mvc;
using SpeakingTime.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Models
{
    public class RoomListViewModel
    {
        public List<Room> Rooms { get; set; }
    }
}
