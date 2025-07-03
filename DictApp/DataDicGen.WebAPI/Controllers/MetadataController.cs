using Microsoft.AspNetCore.Mvc;
using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DataDicGen.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetadataController : ControllerBase
{    private readonly IDatabaseMetadataService _metadataService;
    private readonly IDocumentGenerator _documentGenerator;
    private readonly ICredentialsCacheService _credentialsCache;
    private readonly RedisDatabaseMetadataService _redisService;
    private readonly CassandraDatabaseMetadataService _cassandraService;

    public MetadataController(
        IDatabaseMetadataService metadataService,
        IDocumentGenerator documentGenerator,
        ICredentialsCacheService credentialsCache,
        RedisDatabaseMetadataService redisService,
        CassandraDatabaseMetadataService cassandraService)
    {
        _metadataService = metadataService;
        _documentGenerator = documentGenerator;
        _credentialsCache = credentialsCache;
        _redisService = redisService;
        _cassandraService = cassandraService;
    }

    /// <summary>
    /// Conecta a la base de datos y guarda las credenciales para uso posterior
    /// </summary>
    [HttpPost("connect")]
    public async Task<ActionResult<ConnectionResponseDto>> Connect([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            // Verificar la conexión obteniendo los metadatos
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);

            if (tablas == null || !tablas.Any())
            {
                return NotFound(new ConnectionResponseDto
                {
                    Message = "No se encontraron tablas en la base de datos."
                });
            }

            // Almacenar credenciales y generar token
            string token = _credentialsCache.StoreCredentials(dto);

            return Ok(new ConnectionResponseDto
            {
                Token = token,
                Message = $"Conexión exitosa. Se encontraron {tablas.Count} tablas."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ConnectionResponseDto
            {
                Message = $"Error al conectar: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Descarga el diccionario de datos en formato PDF usando credenciales almacenadas
    /// </summary>
    [HttpGet("diccionario/pdf/{token}")]
    public async Task<IActionResult> DescargarDiccionarioPorToken(string token)
    {
        try
        {
            // Validar el token
            if (!_credentialsCache.HasToken(token))
                return BadRequest("Token inválido o expirado. Por favor, vuelva a conectarse.");

            // Obtener credenciales
            var credentials = _credentialsCache.GetCredentials(token);

            // Generar el PDF
            var tablas = await _metadataService.ObtenerDiccionarioAsync(credentials);
            var pdfBytes = _documentGenerator.GenerarDiccionarioPdf(tablas);

            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el PDF: {ex.Message}");
        }
    }

    /// <summary>
    /// Método original que requiere las credenciales en cada llamada
    /// </summary>
    [HttpPost("diccionario/pdf")]
    public async Task<IActionResult> DescargarDiccionario([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);
            var pdfBytes = _documentGenerator.GenerarDiccionarioPdf(tablas);

            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el PDF: {ex.Message}");
        }
    }
    /// <summary>
    /// Genera vista previa editable del diccionario
    /// </summary>
    [HttpPost("generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreview([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            // Obtenemos el esquema básico usando el servicio existente
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);

            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };

            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview: {ex.Message}");
        }
    }
     /// <summary>
    /// Exporta PDF con datos editados del preview y devuelve un token para conversión posterior
    /// </summary>
    [HttpPost("export-pdf")]
    public async Task<IActionResult> ExportPdf([FromBody] DatabasePreviewDto previewData)
    {
        try
        {
            // Generar PDF con los datos editados de forma asíncrona
            var pdfBytes = await Task.Run(() => _documentGenerator.GenerarDiccionarioPdf(previewData.Tables));

            // Generar un token único
            var token = Guid.NewGuid().ToString();

            // Guardar el PDF temporalmente en disco o memoria (aquí ejemplo en disco)
            var tempPath = Path.Combine(Path.GetTempPath(), $"diccionario_{token}.pdf");
            await System.IO.File.WriteAllBytesAsync(tempPath, pdfBytes);

            // Guardar el preview serializado para conversión a Word
            var tempPreviewPath = Path.Combine(Path.GetTempPath(), $"diccionario_{token}.preview.json");
            var previewJson = System.Text.Json.JsonSerializer.Serialize(previewData);
            await System.IO.File.WriteAllTextAsync(tempPreviewPath, previewJson);

            // Devolver el token al frontend
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al exportar PDF: {ex.Message}");
        }
    }
    /// <summary>
    /// Obtiene el diccionario de datos de MySQL
    /// </summary>
    [HttpPost("mysql/diccionario")]
    public async Task<IActionResult> ObtenerDiccionarioMySql([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var mysqlService = new MySqlDatabaseMetadataService(openAIService);
            var tablas = await mysqlService.ObtenerDiccionarioAsync(dto);
            return Ok(tablas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener el diccionario de datos MySQL: {ex.Message}");
        }
    }

    /// <summary>
    /// Genera vista previa editable del diccionario para MySQL
    /// </summary>
    [HttpPost("mysql/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewMySql([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var mysqlService = new MySqlDatabaseMetadataService(openAIService);
            var tablas = await mysqlService.ObtenerDiccionarioAsync(dto);
            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview MySQL: {ex.Message}");
        }
    }
    /// <summary>
    /// Genera vista previa editable del diccionario para PostgreSQL
    /// </summary>
    [HttpPost("postgres/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewPostgres([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var pgService = new PostgresDatabaseMetadataService(openAIService);
            var tablas = await pgService.ObtenerDiccionarioAsync(dto);
            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview PostgreSQL: {ex.Message}");
        }
    }
    /// <summary>
    /// Genera vista previa editable del diccionario para MongoDB
    /// </summary>
    [HttpPost("mongo/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewMongo([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var mongoService = new MongoDatabaseMetadataService(openAIService);
            var tablas = await mongoService.ObtenerDiccionarioAsync(dto);
            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview MongoDB: {ex.Message}");
        }
    }    /// <summary>
    /// Genera vista previa editable del diccionario para Redis
    /// </summary>
    [HttpPost("redis/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewRedis([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            var preview = await _redisService.GeneratePreviewAsync(dto);
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview Redis: {ex.Message}");
        }
    }    /// <summary>
    /// Genera vista previa editable del diccionario para Cassandra
    /// </summary>
    [HttpPost("cassandra/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewCassandra([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            var preview = await _cassandraService.GeneratePreviewAsync(dto);
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview Cassandra: {ex.Message}");
        }
    }

    /// <summary>
    /// Genera PDF y lo convierte automáticamente a Word manteniendo el formato
    /// </summary>
    [HttpGet("diccionario/word/{token}")]
    public async Task<IActionResult> DescargarDiccionarioWordPorToken(string token)
    {
        try
        {
            // Validar el token
            if (!_credentialsCache.HasToken(token))
                return BadRequest("Token inválido o expirado. Por favor, vuelva a conectarse.");

            // Obtener credenciales
            var credentials = _credentialsCache.GetCredentials(token);

            // Generar el PDF primero
            var tablas = await _metadataService.ObtenerDiccionarioAsync(credentials);
            var pdfBytes = _documentGenerator.GenerarDiccionarioPdf(tablas);

            // Convertir PDF a Word manteniendo el formato exacto
            // var wordBytes = await _pdfToWordConverter.ConvertPdfToWordAsync(pdfBytes); // Eliminado

            // Alternativa: devolver el PDF directamente o lanzar un error informativo
            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el documento Word: {ex.Message}");
        }
    }

    /// <summary>
    /// Genera PDF y lo convierte a Word usando credenciales directas
    /// </summary>
    [HttpPost("diccionario/word")]
    public async Task<IActionResult> DescargarDiccionarioWord([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            // Generar el PDF primero
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);
            var pdfBytes = _documentGenerator.GenerarDiccionarioPdf(tablas);

            // Convertir PDF a Word manteniendo el formato exacto
            // var wordBytes = await _pdfToWordConverter.ConvertPdfToWordAsync(pdfBytes); // Eliminado

            // Alternativa: devolver el PDF directamente o lanzar un error informativo
            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el documento Word: {ex.Message}");
        }
    }
    /// <summary>
    /// Convierte un PDF exportado (usando token) a Word manteniendo el formato exacto
    /// </summary>
    [HttpGet("convert-pdf-to-word/{token}")]
    public async Task<IActionResult> ConvertPdfToWordByToken(string token)
    {
        try
        {
            // Buscar el preview temporal usando el token (mismo flujo que PDF)
            var tempPreviewPath = Path.Combine(Path.GetTempPath(), $"diccionario_{token}.preview.json");
            if (!System.IO.File.Exists(tempPreviewPath))
                return NotFound("No se encontró el preview temporal para el token proporcionado.");

            // Leer el preview serializado
            var previewJson = await System.IO.File.ReadAllTextAsync(tempPreviewPath);
            var previewData = System.Text.Json.JsonSerializer.Deserialize<DataDicGen.Application.Dtos.DatabasePreviewDto>(previewJson);
            if (previewData == null)
                return StatusCode(500, "No se pudo deserializar el preview para generar el Word.");

            // Generar el Word directamente desde los datos
            var wordBytes = _documentGenerator.GenerarDiccionarioWord(previewData.Tables);

            return File(wordBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "diccionario_datos.docx");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el documento Word: {ex.Message}");
        }
    }

    /// <summary>
    /// Descarga el PDF temporal generado por export-pdf usando el token
    /// </summary>
    [HttpGet("download-exported-pdf/{token}")]
    public IActionResult DownloadExportedPdf(string token)
    {
        try
        {
            var tempPath = Path.Combine(Path.GetTempPath(), $"diccionario_{token}.pdf");
            if (!System.IO.File.Exists(tempPath))
                return NotFound("No se encontró el PDF temporal para el token proporcionado.");

            var pdfBytes = System.IO.File.ReadAllBytes(tempPath);
            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al descargar el PDF: {ex.Message}");
        }
    }

    /// <summary>
    /// Exporta Word directamente desde el preview editado (flujo moderno, sin token)
    /// </summary>
    [HttpPost("export-word")]
    public async Task<IActionResult> ExportWord([FromBody] DatabasePreviewDto previewData)
    {
        try
        {
            // Generar el Word directamente desde los datos editados
            var wordBytes = await Task.Run(() => _documentGenerator.GenerarDiccionarioWord(previewData.Tables));
            return File(wordBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "diccionario_datos.docx");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al exportar Word: {ex.Message}");
        }
    }

    /// <summary>
    /// Guarda una nueva versión del diccionario generado por el usuario
    /// </summary>
    [HttpPost("save-version")]
    public async Task<IActionResult> SaveDictionaryVersion([FromServices] Infrastructure.Persistence.AppDbContext db,
        [FromBody] DatabasePreviewDto preview, [FromQuery] string userId, [FromQuery] string databaseType)
    {
        try
        {
            var version = new Domain.Entities.DictionaryVersion
            {
                UserId = userId,
                DatabaseType = databaseType,
                DatabaseName = preview.DatabaseName ?? "",
                GeneratedAt = DateTime.UtcNow,
                Content = System.Text.Json.JsonSerializer.Serialize(preview),
                // Puedes calcular el número de versión aquí si lo deseas
            };
            db.DictionaryVersions.Add(version);
            await db.SaveChangesAsync();
            return Ok(new { version.Id, version.GeneratedAt });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al guardar la versión: {ex.Message}");
        }
    }

    /// <summary>
    /// Lista el historial de versiones de diccionario de un usuario
    /// </summary>
    [HttpGet("versions")]
    public async Task<IActionResult> GetDictionaryVersions([FromServices] Infrastructure.Persistence.AppDbContext db, [FromQuery] string userId)
    {
        try
        {
            var versions = await db.DictionaryVersions
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.GeneratedAt)
                .Select(v => new {
                    v.Id,
                    v.DatabaseType,
                    v.DatabaseName,
                    v.GeneratedAt,
                    v.VersionNumber,
                    v.Tag,
                    v.Content // <-- incluir el contenido completo
                })
                .ToListAsync();
            return Ok(versions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener el historial: {ex.Message}");
        }
    }
}
