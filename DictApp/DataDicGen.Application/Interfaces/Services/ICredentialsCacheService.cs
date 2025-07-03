using DataDicGen.Application.Dtos;
using System.Collections.Concurrent;

namespace DataDicGen.Application.Interfaces.Services;

public interface ICredentialsCacheService
{
    /// <summary>
    /// Almacena las credenciales en el caché y devuelve un token único
    /// </summary>
    string StoreCredentials(DatabaseConnectionDto credentials);

    /// <summary>
    /// Obtiene las credenciales almacenadas usando el token
    /// </summary>
    DatabaseConnectionDto GetCredentials(string token);

    /// <summary>
    /// Verifica si un token existe en el caché
    /// </summary>
    bool HasToken(string token);

    /// <summary>
    /// Elimina las credenciales asociadas a un token
    /// </summary>
    void RemoveCredentials(string token);
     void CacheAIResponse(string connectionKey, string promptKey, object response);
    T? GetCachedAIResponse<T>(string connectionKey, string promptKey);
}