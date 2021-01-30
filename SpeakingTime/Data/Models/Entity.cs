using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Data.Models
{
    public class Entity
    {
        public int Id { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime UpdatedDateTime { get; set; }
        public DateTime? DeletedDateTime { get; set; }
    }
}
