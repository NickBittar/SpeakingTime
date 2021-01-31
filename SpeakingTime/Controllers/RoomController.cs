using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpeakingTime.Models;
using SpeakingTime.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Controllers
{
    public class RoomController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IRoomService _roomService;
        private readonly IUserService _userService;
        private readonly IConnectionService _connectionService;

        public RoomController(ILogger<HomeController> logger, IRoomService roomService, IUserService userService, IConnectionService connectionService)
        {
            _logger = logger;
            _roomService = roomService;
            _userService = userService;
            _connectionService = connectionService;
        }

        [HttpGet("r/{id}")]
        public IActionResult Room(string id)
        {
            var room = _roomService.GetRoom(id);
            var model = new RoomViewModel
            {
                RoomId = room.RoomId,
                RoomName = room.RoomName,
            };
            return View("Room", model);
        }

        [HttpGet]
        public IActionResult Join()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Join(JoinRoomInputModel roomInput)
        {
            var room = _roomService.GetRoom(roomInput.RoomId);
            if(room != null)
            {
                // Go to room
                return RedirectToAction("Room", "Room", new { id = room.RoomId });
            }
            else
            {
                // Room not found
                return View();
            }
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Create(CreateRoomInputModel roomInput)
        {
            var room = _roomService.CreateRoom(roomInput);
            return RedirectToAction("Room", "Room", new { id = room.RoomId });
        }

        public IActionResult List()
        {
            var rooms = _roomService.GetRooms();
            var connections = _connectionService.GetConnections(true);
            var model = new RoomListViewModel { Rooms = rooms, Connections = connections };
            return View(model);
        }

        public IActionResult Info(int id)
        {
            var room = _roomService.GetRoom(id);
            var model = new RoomInfoViewModel
            {
                Room = room,
                Users = _userService.GetUsersInRoom(room.RoomId),
                Connections = _connectionService.GetRoomConnections(room.RoomId, true),
            };
            return View(model);
        }
    }
}
