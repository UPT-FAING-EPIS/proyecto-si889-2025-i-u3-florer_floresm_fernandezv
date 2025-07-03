using Microsoft.EntityFrameworkCore;
using DataDicGen.Domain.Entities;

namespace DataDicGen.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }  // Por ahora solo la tabla de usuarios
        public DbSet<DictionaryVersion> DictionaryVersions { get; set; } // Tabla de versiones de diccionario

        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     base.OnModelCreating(modelBuilder);

        //     // Config inicial opcional
        //     modelBuilder.Entity<User>().HasKey(u => u.Username); // Por ejemplo
        // }
    }
}
