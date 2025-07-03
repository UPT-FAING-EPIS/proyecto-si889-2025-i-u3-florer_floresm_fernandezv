using System.Text;
using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using Npgsql;

namespace DataDicGen.Infrastructure.Services;

public class PostgresDatabaseMetadataService : IDatabaseMetadataService
{
    private readonly IOpenAIService _openAIService;

    public PostgresDatabaseMetadataService(IOpenAIService openAIService)
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
            var port = dto.Port ?? 5432; // Puerto por defecto de PostgreSQL
            connectionString = $"Host={dto.Server};Port={port};Database={dto.Database};Username={dto.User};Password={dto.Password};";
        }
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        // Obtener tablas
        var tablas = new List<string>();
        var tablasQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'";
        using (var cmd = new NpgsqlCommand(tablasQuery, connection))
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
                tablas.Add(reader.GetString(0));
        }

        foreach (var tabla in tablas)
        {
            // Columnas
            var columnas = new List<ColumnSchemaDto>();
            var columnasQuery = @"
                SELECT column_name, data_type, is_nullable, character_maximum_length
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = @TableName";
            using (var cmd = new NpgsqlCommand(columnasQuery, connection))
            {
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

            // Relaciones (claves foráneas)
            var relaciones = new List<string>();
            var foreignKeysQuery = @"
                SELECT kcu.column_name, ccu.table_name AS foreign_table_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = @TableName;";
            using (var cmd = new NpgsqlCommand(foreignKeysQuery, connection))
            {
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
