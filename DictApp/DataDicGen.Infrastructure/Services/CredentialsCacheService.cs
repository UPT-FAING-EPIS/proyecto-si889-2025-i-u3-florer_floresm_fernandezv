using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using System;
using System.Collections.Concurrent;

namespace DataDicGen.Infrastructure.Services;

public class CredentialsCacheService : ICredentialsCacheService
{
    // Caché de credenciales con token como clave
    private readonly ConcurrentDictionary<string, CachedCredentials> _cache = new();
       // Caché de respuestas de IA - CAMBIAR A ConcurrentDictionary
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, object>> _aiCache = new();
    
    // Tiempo de expiración en minutos
    private readonly int _expirationMinutes = 30;

    private class CachedCredentials
    {
        public DatabaseConnectionDto Credentials { get; set; }
        public DateTime ExpirationTime { get; set; }
    }
    
    public string StoreCredentials(DatabaseConnectionDto credentials)
    {
        // Limpiar caché expirado
        CleanExpiredCache();
        
        // Generar un token único
        string token = Guid.NewGuid().ToString();
        
        // Calcular tiempo de expiración
        DateTime expirationTime = DateTime.UtcNow.AddMinutes(_expirationMinutes);
        
        // Guardar en caché
        _cache[token] = new CachedCredentials
        {
            Credentials = credentials,
            ExpirationTime = expirationTime
        };
        
        return token;
    }
    // Agregar estas propiedades a la clase existente
    public T? GetCachedAIResponse<T>(string connectionKey, string promptKey)
    {
        if (_aiCache.TryGetValue(connectionKey, out var connectionCache) && 
            connectionCache.TryGetValue(promptKey, out var response))
        {
            return (T)response;
        }
        return default(T);
    }

    public void CacheAIResponse(string connectionKey, string promptKey, object response)
    {
        // Usar GetOrAdd para thread safety
        var connectionCache = _aiCache.GetOrAdd(connectionKey, _ => new ConcurrentDictionary<string, object>());
        connectionCache[promptKey] = response;
    }

    public DatabaseConnectionDto GetCredentials(string token)
    {
        if (!HasToken(token))
            return null;

        return _cache[token].Credentials;
    }

    public bool HasToken(string token)
    {
        // Verificar si el token existe y no ha expirado
        if (_cache.TryGetValue(token, out var cached))
        {
            if (cached.ExpirationTime > DateTime.UtcNow)
                return true;
                
            // Si expiró, removerlo
            RemoveCredentials(token);
        }
        
        return false;
    }

    public void RemoveCredentials(string token)
    {
        _cache.TryRemove(token, out _);
                // También limpiar el caché de IA asociado
        _aiCache.TryRemove(token, out _);
    }
    
    private void CleanExpiredCache()
    {
        // Remover todos los tokens expirados
        var now = DateTime.UtcNow;
        
        foreach (var key in _cache.Keys)
        {
            if (_cache.TryGetValue(key, out var cached) && cached.ExpirationTime <= now)
            {
                _cache.TryRemove(key, out _);
            }
        }
    }
}