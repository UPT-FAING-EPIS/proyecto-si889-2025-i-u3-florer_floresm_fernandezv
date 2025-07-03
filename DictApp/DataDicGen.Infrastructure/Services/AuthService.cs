using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Domain.Entities;
using DataDicGen.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DataDicGen.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;

    public AuthService(AppDbContext context)
    {
        _context = context;
    }

    public bool ValidateUser(string username, string password)
    {
        var user = _context.Users.FirstOrDefault(u => u.Username == username && u.Password == password);
        return user != null;
    }

    public async Task<User?> RegisterUserAsync(string username, string password)
    {
        // Verificar si el usuario ya existe
        if (await UserExistsAsync(username))
        {
            return null; // Usuario ya existe
        }

        // Crear nuevo usuario
        var newUser = new User
        {
            Username = username,
            Password = password // TODO: Implementar hash de contraseña en el futuro
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return newUser;
    }

    public async Task<bool> UserExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }
}