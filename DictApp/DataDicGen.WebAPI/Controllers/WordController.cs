using Microsoft.AspNetCore.Mvc;
using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DataDicGen.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WordController : ControllerBase
{
    private readonly IDatabaseMetadataService _metadataService;
    private readonly IDocumentGenerator _documentGenerator;
    private readonly ICredentialsCacheService _credentialsCache;

    public WordController(
        IDatabaseMetadataService metadataService, 
        IDocumentGenerator documentGenerator,
        ICredentialsCacheService credentialsCache)
    {
        _metadataService = metadataService;
        _documentGenerator = documentGenerator;
        _credentialsCache = credentialsCache;
    }

    /// <summary>
    /// Genera y descarga un diccionario de datos en formato Word (DOCX) usando un token
    /// </summary>
    [HttpGet("diccionario/word/{token}")]
    [Produces("application/vnd.openxmlformats-officedocument.wordprocessingml.document")]
    public async Task<IActionResult> DescargarDiccionarioWordPorToken(string token)
    {
        try
        {
            // Validar el token
            if (!_credentialsCache.HasToken(token))
                return BadRequest("Token inválido o expirado. Por favor, vuelva a conectarse.");
                
            // Obtener credenciales
            var credentials = _credentialsCache.GetCredentials(token);
            
            // Obtener los metadatos y generar el documento
            var tablas = await _metadataService.ObtenerDiccionarioAsync(credentials);
            
            if (tablas == null || !tablas.Any())
            {
                return NotFound("No se encontraron tablas en la base de datos.");
            }

            // Generar el documento Word
            var wordBytes = _documentGenerator.GenerarDiccionarioWord(tablas);
            
            // Configurar para descarga
            Response.Headers.Add("Content-Disposition", "attachment; filename=diccionario_datos.docx");
            
            // Devolver el documento Word para descarga
            return File(wordBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el documento Word: {ex.Message}");
        }
    }

    /// <summary>
    /// Genera y descarga un diccionario de datos en formato Word (DOCX)
    /// </summary>
    [HttpPost("diccionario/word")]
    [Produces("application/vnd.openxmlformats-officedocument.wordprocessingml.document")]
    public async Task<IActionResult> DescargarDiccionarioWord([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            // Obtener los metadatos de la base de datos
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);
            
            if (tablas == null || !tablas.Any())
            {
                return NotFound("No se encontraron tablas en la base de datos.");
            }

            // Generar el documento Word
            var wordBytes = _documentGenerator.GenerarDiccionarioWord(tablas);
            
            // Configurar para descarga en lugar de visualización
            Response.Headers.Add("Content-Disposition", "attachment; filename=diccionario_datos.docx");
            
            // Devolver el documento Word para descarga
            return File(wordBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el documento Word: {ex.Message}");
        }
    }
}