using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Infrastructure.Persistence;
using StackExchange.Redis;
using System.Text.Json;

namespace DataDicGen.Infrastructure.Services
{
    public class RedisDatabaseMetadataService
    {
        private readonly IOpenAIService _openAIService;

        public RedisDatabaseMetadataService(IOpenAIService openAIService)
        {
            _openAIService = openAIService;
        }
        public async Task<DatabasePreviewDto> GeneratePreviewAsync(DatabaseConnectionDto connectionDto)
        {
            try
            {
                var port = connectionDto.Port ?? 6379; // Puerto por defecto de Redis
                var connectionString = $"{connectionDto.Server}:{port}";
                
                if (!string.IsNullOrEmpty(connectionDto.Password))
                {
                    connectionString += $",password={connectionDto.Password}";
                }
                
                if (connectionDto.UseSsl)
                {
                    connectionString += ",ssl=true";
                }                using var redis = ConnectionMultiplexer.Connect(connectionString);
                var database = redis.GetDatabase(connectionDto.RedisDatabase ?? 0);
                
                // Test connection with a simple ping
                await database.PingAsync();

                var preview = new DatabasePreviewDto
                {
                    DatabaseName = $"Redis DB {connectionDto.RedisDatabase ?? 0}",
                    Tables = new List<TableSchemaDto>()
                };                // Analizar tipos de datos Redis usando métodos básicos
                var keyTypes = new Dictionary<string, int>
                {
                    ["string"] = 0,
                    ["hash"] = 0,
                    ["list"] = 0,
                    ["set"] = 0,
                    ["zset"] = 0,
                    ["stream"] = 0
                };

                // Obtener una muestra de keys (limitada para evitar problemas de rendimiento)
                try
                {
                    // Intentar obtener algunas keys para análisis
                    var server = redis.GetServer(connectionDto.Server, port);
                    var keys = server.Keys(database: connectionDto.RedisDatabase ?? 0, pattern: "*", pageSize: 100).Take(100);
                    
                    foreach (var key in keys)
                    {
                        try
                        {
                            var keyType = await database.KeyTypeAsync(key);
                            var typeStr = keyType.ToString().ToLower();
                            if (keyTypes.ContainsKey(typeStr))
                            {
                                keyTypes[typeStr]++;
                            }
                        }
                        catch
                        {
                            // Si no podemos obtener el tipo de una key específica, continuamos
                            continue;
                        }
                    }
                }
                catch
                {
                    // Si no podemos enumerar keys (por permisos), solo mostramos una estructura básica
                    keyTypes["string"] = 1; // Asumimos al menos una key string
                }                // Crear tabla virtual para tipos de datos Redis
                var dataTypesTable = new TableSchemaDto
                {
                    TableName = "redis_data_types",
                    TableDescription = await _openAIService.GenerarDescripcionTablaAsync("redis_data_types", keyTypes.Keys.ToList()),
                    TablePurpose = await _openAIService.GenerarPropositoTablaAsync("redis_data_types"),
                    Columns = new List<ColumnSchemaDto>()
                };                foreach (var kvp in keyTypes.Where(k => k.Value > 0))
                {
                    var columnName = $"{kvp.Key}_count";
                    var columnDescription = await _openAIService.GenerarDescripcionColumnaAsync("redis_data_types", columnName);
                    
                    dataTypesTable.Columns.Add(new ColumnSchemaDto
                    {
                        ColumnName = columnName,
                        DataType = "integer",
                        IsNullable = false,
                        IsPrimaryKey = false,
                        IsForeignKey = false,
                        DefaultValue = kvp.Value.ToString(),
                        Description = columnDescription
                    });
                }

                preview.Tables.Add(dataTypesTable);                // Crear tabla virtual para información básica de conexión
                var connectionInfoTable = new TableSchemaDto
                {
                    TableName = "redis_connection_info",
                    TableDescription = await _openAIService.GenerarDescripcionTablaAsync("redis_connection_info", new List<string> { "database_number", "server_address", "port" }),
                    TablePurpose = await _openAIService.GenerarPropositoTablaAsync("redis_connection_info"),                    Columns = new List<ColumnSchemaDto>
                    {
                        new ColumnSchemaDto
                        {
                            ColumnName = "database_number",
                            DataType = "integer",
                            IsNullable = false,
                            IsPrimaryKey = true,
                            IsForeignKey = false,
                            DefaultValue = (connectionDto.RedisDatabase ?? 0).ToString(),
                            Description = await _openAIService.GenerarDescripcionColumnaAsync("redis_connection_info", "database_number")
                        },
                        new ColumnSchemaDto
                        {
                            ColumnName = "server_address",
                            DataType = "string",
                            IsNullable = false,
                            IsPrimaryKey = false,
                            IsForeignKey = false,
                            DefaultValue = connectionDto.Server,
                            Description = await _openAIService.GenerarDescripcionColumnaAsync("redis_connection_info", "server_address")
                        },
                        new ColumnSchemaDto
                        {
                            ColumnName = "port",
                            DataType = "integer",
                            IsNullable = false,
                            IsPrimaryKey = false,
                            IsForeignKey = false,                            DefaultValue = port.ToString(),
                            Description = await _openAIService.GenerarDescripcionColumnaAsync("redis_connection_info", "port")
                        },
                        new ColumnSchemaDto
                        {
                            ColumnName = "ssl_enabled",
                            DataType = "boolean",
                            IsNullable = false,
                            IsPrimaryKey = false,
                            IsForeignKey = false,
                            DefaultValue = connectionDto.UseSsl.ToString(),
                            Description = await _openAIService.GenerarDescripcionColumnaAsync("redis_connection_info", "ssl_enabled")
                        }
                    }
                };

                preview.Tables.Add(connectionInfoTable);

                return preview;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al conectar con Redis: {ex.Message}", ex);
            }
        }
    }
}
