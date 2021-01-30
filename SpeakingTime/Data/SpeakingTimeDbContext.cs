using Microsoft.EntityFrameworkCore;
using SpeakingTime.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.Data
{
    public class SpeakingTimeDbContext : DbContext
    {
        public SpeakingTimeDbContext(DbContextOptions<SpeakingTimeDbContext> options)
          : base(options) { }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Message> Messages { get; set; }
    }
}
