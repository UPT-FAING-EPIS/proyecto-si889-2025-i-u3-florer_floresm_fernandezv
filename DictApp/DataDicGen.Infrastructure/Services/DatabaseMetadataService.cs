using System.Data;
using System.Text;
using DataDicGen.Application.Interfaces.Services;
using Microsoft.Data.SqlClient;

namespace DataDicGen.Infrastructure.Services;

public class DatabaseMetadataService : IDatabaseMetadataService
{
    private readonly IOpenAIService _openAIService;

    public DatabaseMetadataService(IOpenAIService openAIService)
    {
        _openAIService = openAIService;
    }

    public async Task<List<TableSchemaDto>> ObtenerDiccionarioAsync(DatabaseConnectionDto dto)
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
            connectionString = $"Server={dto.Server};Database={dto.Database};User Id={dto.User};Password={dto.Password};TrustServerCertificate=True;";
        }

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var clavesPrimarias = await ObtenerClavesPrimariasAsync(connection);
        var clavesForaneas = await ObtenerClavesForaneasAsync(connection);

        var tablasQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
        var tablas = new List<string>();

        using (var cmd = new SqlCommand(tablasQuery, connection))
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                tablas.Add(reader.GetString(0));
            }
        }

        foreach (var tabla in tablas)
        {
            var columnasQuery = @"
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = @TableName";

            var columnas = new List<ColumnSchemaDto>();

            using (var cmd = new SqlCommand(columnasQuery, connection))
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
                        IsPrimaryKey = clavesPrimarias.Contains((tabla, columnName)),
                        IsForeignKey = clavesForaneas.Any(fk => fk.Table == tabla && fk.Column == columnName),
                        Description = descripcionCampo
                    });
                }
            }

            var descripcionTabla = await _openAIService.GenerarDescripcionTablaAsync(tabla, columnas.Select(c => c.ColumnName).ToList());
            var propositoTabla = await _openAIService.GenerarPropositoTablaAsync(tabla);
            var insertsEjemplo = await _openAIService.GenerarInsertDeEjemploConIAAsync(tabla, columnas);

            var tablasRelacionadas = clavesForaneas
                .Where(fk => fk.Table == tabla)
                .Select(fk => "dbo." + fk.ReferencedTable)
                .Distinct()
                .ToList();

            var relacionesTexto = tablasRelacionadas.Any()
                ? string.Join(", ", tablasRelacionadas)
                : "Sin relaciones detectadas.";

            var scriptCreate = GenerarCreateTableDesdeSchema(tabla, columnas);
            var procedimientos = await ObtenerProcedimientosAlmacenadosRelacionadosAsync(connection, tabla);

            resultado.Add(new TableSchemaDto
            {
                TableName = tabla,
                TableDescription = descripcionTabla,
                TablePurpose = propositoTabla,
                TableRelationships = relacionesTexto,
                Columns = columnas,
                DmlInserts = insertsEjemplo,
                DdlCreateScript = scriptCreate,
                StoredProcedures = procedimientos
            });
        }

        return resultado;
    }

    private async Task<HashSet<(string Table, string Column)>> ObtenerClavesPrimariasAsync(SqlConnection connection)
    {
        var resultado = new HashSet<(string, string)>();
        var query = @"
            SELECT 
                tc.TABLE_NAME, 
                kcu.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
                ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'";

        using var cmd = new SqlCommand(query, connection);
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            resultado.Add((reader.GetString(0), reader.GetString(1)));
        }

        return resultado;
    }

    private async Task<List<(string Table, string Column, string ReferencedTable)>> ObtenerClavesForaneasAsync(SqlConnection connection)
    {
        var resultado = new List<(string, string, string)>();

        var query = @"
            SELECT 
                fk_tab.TABLE_NAME AS TableName,
                fk_col.COLUMN_NAME AS ColumnName,
                pk_tab.TABLE_NAME AS ReferencedTable
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS rc
            JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS fk_tab
                ON rc.CONSTRAINT_NAME = fk_tab.CONSTRAINT_NAME
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS fk_col
                ON fk_tab.CONSTRAINT_NAME = fk_col.CONSTRAINT_NAME
            JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS pk_tab
                ON rc.UNIQUE_CONSTRAINT_NAME = pk_tab.CONSTRAINT_NAME";

        using var cmd = new SqlCommand(query, connection);
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var table = reader.GetString(0);
            var column = reader.GetString(1);
            var referencedTable = reader.GetString(2);

            resultado.Add((table, column, referencedTable));
        }

        return resultado;
    }

    public string GenerarCreateTableDesdeSchema(string tabla, List<ColumnSchemaDto> columnas)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"CREATE TABLE dbo.{tabla} (");

        for (int i = 0; i < columnas.Count; i++)
        {
            var col = columnas[i];
            var tipo = col.DataType;
            if (col.MaxLength.HasValue && col.MaxLength > 0 && tipo != "int" && tipo != "bit")
                tipo += $"({col.MaxLength})";

            var nullText = col.IsNullable ? "NULL" : "NOT NULL";
            var pk = col.IsPrimaryKey ? " PRIMARY KEY" : "";

            sb.AppendLine($"    {col.ColumnName} {tipo} {nullText}{pk}" + (i < columnas.Count - 1 ? "," : ""));
        }

        sb.AppendLine(");");
        return sb.ToString();
    }

    public async Task<string> ObtenerProcedimientosAlmacenadosRelacionadosAsync(SqlConnection connection, string tabla)
    {
        var query = @"
            SELECT name, OBJECT_DEFINITION(object_id)
            FROM sys.procedures
            WHERE OBJECT_DEFINITION(object_id) LIKE @search";

        using var cmd = new SqlCommand(query, connection);
        cmd.Parameters.AddWithValue("@search", $"%{tabla}%");

        using var reader = await cmd.ExecuteReaderAsync();
        var sb = new StringBuilder();

        while (await reader.ReadAsync())
        {
            var name = reader.GetString(0);
            var body = reader.IsDBNull(1) ? "-- Sin contenido --" : reader.GetString(1);
            sb.AppendLine($"/****** PROCEDIMIENTO: {name} ******/");
            sb.AppendLine(body);
            sb.AppendLine();
        }

        return sb.Length > 0 ? sb.ToString() : "No se encontraron procedimientos almacenados.";
    }
}
