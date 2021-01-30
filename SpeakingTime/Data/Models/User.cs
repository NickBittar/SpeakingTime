using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Data.Models
{
    public class User : Entity
    {
        public string Name { get; set; }
        public string Color { get; set; }
    }
}
