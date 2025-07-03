using DataDicGen.Domain.Entities;

namespace DataDicGen.Application.Interfaces.Services;

public interface IAuthService
{
    bool ValidateUser(string username, string password);
    Task<User?> RegisterUserAsync(string username, string password);
    Task<bool> UserExistsAsync(string username);
}