using System.Text;
using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using MySql.Data.MySqlClient;

namespace DataDicGen.Infrastructure.Services;

public class MySqlDatabaseMetadataService : IDatabaseMetadataService
{
    private readonly IOpenAIService _openAIService;

    public MySqlDatabaseMetadataService(IOpenAIService openAIService)
    {
        _openAIService = openAIService;
    }    public async Task<List<TableSchemaDto>> ObtenerDiccionarioAsync(DatabaseConnectionDto dto)
    {
        var resultado = new List<TableSchemaDto>();
        // Si se provee una cadena de conexión personalizada, usarla directamente
        string connectionString;
        if (!string.IsNullOrWhiteSpace(dto.ConnectionString))
        {
            connectionString = dto.ConnectionString;
        }
        else
        {
            var port = dto.Port ?? 3306; // Puerto por defecto de MySQL
            connectionString = $"Server={dto.Server};Port={port};Database={dto.Database};Uid={dto.User};Pwd={dto.Password};";
        }
        using var connection = new MySql.Data.MySqlClient.MySqlConnection(connectionString);
        await connection.OpenAsync();

        // Obtener tablas
        var tablas = new List<string>();
        var tablasQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = @Database";
        using (var cmd = new MySqlCommand(tablasQuery, connection))
        {
            cmd.Parameters.AddWithValue("@Database", dto.Database);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                tablas.Add(reader.GetString(0));
        }

        foreach (var tabla in tablas)
        {
            // Columnas
            var columnas = new List<ColumnSchemaDto>();
            var columnasQuery = @"
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = @Database AND TABLE_NAME = @TableName";
            using (var cmd = new MySqlCommand(columnasQuery, connection))
            {
                cmd.Parameters.AddWithValue("@Database", dto.Database);
                cmd.Parameters.AddWithValue("@TableName", tabla);
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var columnName = reader.GetString(0);
                    var descripcionCampo = await _openAIService.GenerarDescripcionColumnaAsync(tabla, columnName);

                    columnas.Add(new ColumnSchemaDto
                    {
                        ColumnName = columnName,
                        DataType = reader.GetString(1),
                        IsNullable = reader.GetString(2) == "YES",
                        MaxLength = reader.IsDBNull(3) ? null : reader.GetInt32(3),
                        Description = descripcionCampo
                    });
                }
            }

            // Obtener claves foráneas y relaciones
            var relaciones = new List<string>();
            var foreignKeysQuery = @"
                SELECT COLUMN_NAME, REFERENCED_TABLE_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = @Database AND TABLE_NAME = @TableName AND REFERENCED_TABLE_NAME IS NOT NULL";
            using (var cmd = new MySqlCommand(foreignKeysQuery, connection))
            {
                cmd.Parameters.AddWithValue("@Database", dto.Database);
                cmd.Parameters.AddWithValue("@TableName", tabla);
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var colName = reader.GetString(0);
                    var refTable = reader.GetString(1);
                    var col = columnas.Find(c => c.ColumnName == colName);
                    if (col != null)
                        col.IsForeignKey = true;
                    if (!string.IsNullOrEmpty(refTable) && !relaciones.Contains(refTable))
                        relaciones.Add(refTable);
                }
            }

            // Descripciones IA
            var descripcionTabla = await _openAIService.GenerarDescripcionTablaAsync(tabla, columnas.Select(c => c.ColumnName).ToList());
            var propositoTabla = await _openAIService.GenerarPropositoTablaAsync(tabla);
            var insertsEjemplo = await _openAIService.GenerarInsertDeEjemploConIAAsync(tabla, columnas);

            resultado.Add(new TableSchemaDto
            {
                TableName = tabla,
                TableDescription = descripcionTabla,
                TablePurpose = propositoTabla,
                TableRelationships = relaciones.Any() ? string.Join(", ", relaciones) : "Sin relaciones detectadas.",
                Columns = columnas,
                DmlInserts = insertsEjemplo,
            });
        }

        return resultado;
    }
}