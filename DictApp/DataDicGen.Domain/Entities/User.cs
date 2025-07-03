namespace DataDicGen.Domain.Entities;

public class User
{
    public int Id { get; set; } // Clave primaria
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Por ahora sin codificar
}
