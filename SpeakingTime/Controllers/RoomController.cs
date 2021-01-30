using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Controllers
{
    [Route("[controller]")]
    public class RoomController : Controller
    {
        [HttpGet("{id}")]
        public IActionResult Index(string id)
        {
            return View("Room");
        }
    }
}
