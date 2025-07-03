using Microsoft.AspNetCore.Mvc;
using DataDicGen.Application.Interfaces.Services;

namespace DataDicGen.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (_authService.ValidateUser(request.Username, request.Password))
            return Ok(new { message = "Login exitoso" });

        return Unauthorized(new { message = "Credenciales inválidas" });
    }

    /// <summary>
    /// Registra un nuevo usuario en el sistema
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Validar datos de entrada
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Usuario y contraseña son requeridos" });
        }

        if (request.Username.Length < 3)
        {
            return BadRequest(new { message = "El usuario debe tener al menos 3 caracteres" });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });
        }

        try
        {
            var user = await _authService.RegisterUserAsync(request.Username, request.Password);
            
            if (user == null)
            {
                return Conflict(new { message = "El usuario ya existe" });
            }

            return CreatedAtAction(nameof(Register), new { id = user.Id }, 
                new { message = "Usuario registrado exitosamente", userId = user.Id, username = user.Username });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
