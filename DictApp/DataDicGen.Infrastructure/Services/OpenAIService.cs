using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Application.Dtos;

namespace DataDicGen.Infrastructure.Services;
public class OpenAIService : IOpenAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
     private readonly ICredentialsCacheService _credentialsCache;

    public OpenAIService(HttpClient httpClient, IConfiguration configuration, ICredentialsCacheService credentialsCache)
    {
        _httpClient = httpClient;
        _apiKey = configuration["OpenAI:ApiKey"] ?? throw new ArgumentNullException("La API Key de OpenAI no está configurada");
         _credentialsCache = credentialsCache;
    }

    public async Task<string> GenerarDescripcionTablaAsync(string tabla, List<string> columnas)
    {
        var cacheKey = $"tabla_desc_{tabla}_{string.Join("_", columnas)}";
        var cached = _credentialsCache.GetCachedAIResponse<string>("current", cacheKey);
        
        if (!string.IsNullOrEmpty(cached))
            return cached;

        var prompt = $"Estoy documentando una base de datos. Describe brevemente el propósito de una tabla llamada '{tabla}' basándote en su nombre y en estas columnas: {string.Join(", ", columnas)}. La descripción debe indicar qué registra o almacena la tabla, en no más de 30 palabras.";
        var result = await EnviarPromptAsync(prompt, 100);
        
        _credentialsCache.CacheAIResponse("current", cacheKey, result);
        return result;
    }

   public async Task<string> GenerarDescripcionColumnaAsync(string tabla, string columna)
    {
        var cacheKey = $"columna_desc_{tabla}_{columna}";
        var cached = _credentialsCache.GetCachedAIResponse<string>("current", cacheKey);
        
        if (!string.IsNullOrEmpty(cached))
            return cached;

        var prompt = $"Estoy documentando una base de datos. Describe en términos técnicos y en no más de 15 palabras la finalidad de la columna '{columna}' de la tabla '{tabla}'.";
        var result = await EnviarPromptAsync(prompt, 60);
        
        _credentialsCache.CacheAIResponse("current", cacheKey, result);
        return result;
    }

     public async Task<string> GenerarPropositoTablaAsync(string tabla)
    {
        var cacheKey = $"proposito_{tabla}";
        var cached = _credentialsCache.GetCachedAIResponse<string>("current", cacheKey);
        
        if (!string.IsNullOrEmpty(cached))
            return cached;

        var prompt = $"¿Cuál es el propósito general de una tabla llamada '{tabla}' en una base de datos empresarial? Responde en una sola frase técnica de no más de 30 palabras.";
        var result = await EnviarPromptAsync(prompt, 60);
        
        _credentialsCache.CacheAIResponse("current", cacheKey, result);
        return result;
    }
    
    public async Task<string> GenerarInsertDeEjemploConIAAsync(string tabla, List<ColumnSchemaDto> columnas)
    {
        var columnasStr = string.Join("_", columnas.Select(c => c.ColumnName));
        var cacheKey = $"inserts_{tabla}_{columnasStr}";
        var cached = _credentialsCache.GetCachedAIResponse<string>("current", cacheKey);
        
        if (!string.IsNullOrEmpty(cached))
            return cached;

        var columnasStrDisplay = string.Join(", ", columnas.Select(c => c.ColumnName));
        var prompt = $"Genera 5 sentencias SQL INSERT INTO para la tabla '{tabla}' con las siguientes columnas: {columnasStrDisplay}. Usa datos de ejemplo realistas.";
        var result = await EnviarPromptAsync(prompt, 500);
        
        _credentialsCache.CacheAIResponse("current", cacheKey, result);
        return result;
    }
    

    private async Task<string> EnviarPromptAsync(string prompt, int maxTokens)
    {
        var requestBody = new
        {
            model = "gpt-4o-mini",
            messages = new[] { new { role = "user", content = prompt } },
            max_tokens = maxTokens,
            temperature = 0.5
        };

        var requestJson = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"OpenAI API error: {response.StatusCode}\n{responseJson}");

        using var doc = JsonDocument.Parse(responseJson);
        var result = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return result?.Trim() ?? string.Empty;
    }
}