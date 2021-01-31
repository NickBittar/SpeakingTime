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
    public class UserController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IUserService _userService;

        public UserController(ILogger<HomeController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Create(CreateUserInputModel userInput)
        {
            var user = _userService.CreateUser(userInput);
            return View();
        }
    }
}
