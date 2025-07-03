using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Infrastructure.Persistence;
using Cassandra;

namespace DataDicGen.Infrastructure.Services
{
    public class CassandraDatabaseMetadataService
    {
        private readonly IOpenAIService _openAIService;

        public CassandraDatabaseMetadataService(IOpenAIService openAIService)
        {
            _openAIService = openAIService;
        }
        public async Task<DatabasePreviewDto> GeneratePreviewAsync(DatabaseConnectionDto connectionDto)
        {
            try
            {
                var port = connectionDto.Port ?? 9042; // Puerto por defecto de Cassandra
                
                var cluster = Cluster.Builder()
                    .AddContactPoint(connectionDto.Server)
                    .WithPort(port);

                if (!string.IsNullOrEmpty(connectionDto.User) && !string.IsNullOrEmpty(connectionDto.Password))
                {
                    cluster = cluster.WithCredentials(connectionDto.User, connectionDto.Password);
                }

                var session = await cluster.Build().ConnectAsync();

                var preview = new DatabasePreviewDto
                {
                    DatabaseName = connectionDto.Keyspace ?? "cassandra_cluster",
                    Tables = new List<TableSchemaDto>()
                };

                // Si se especifica un keyspace, usarlo
                if (!string.IsNullOrEmpty(connectionDto.Keyspace))
                {
                    session = await cluster.Build().ConnectAsync(connectionDto.Keyspace);
                }                // Obtener información de keyspaces (consulta más simple)
                var keyspacesQuery = "SELECT keyspace_name FROM system_schema.keyspaces";
                var keyspacesResult = await session.ExecuteAsync(new SimpleStatement(keyspacesQuery));                foreach (var keyspaceRow in keyspacesResult)
                {
                    var keyspaceName = keyspaceRow.GetValue<string>("keyspace_name");
                    
                    // Filtrar keyspaces del sistema
                    if (keyspaceName.StartsWith("system"))
                        continue;
                      // Crear tabla virtual para el keyspace
                    var keyspaceTable = new TableSchemaDto
                    {
                        TableName = $"keyspace_{keyspaceName}",
                        TableDescription = await _openAIService.GenerarDescripcionTablaAsync($"keyspace_{keyspaceName}", new List<string> { "keyspace_name", "type" }),
                        TablePurpose = await _openAIService.GenerarPropositoTablaAsync($"keyspace_{keyspaceName}"),
                        Columns = new List<ColumnSchemaDto>
                        {
                            new ColumnSchemaDto
                            {
                                ColumnName = "keyspace_name",
                                DataType = "text",
                                IsNullable = false,
                                IsPrimaryKey = true,
                                IsForeignKey = false,
                                DefaultValue = keyspaceName,
                                Description = await _openAIService.GenerarDescripcionColumnaAsync($"keyspace_{keyspaceName}", "keyspace_name")
                            },
                            new ColumnSchemaDto
                            {
                                ColumnName = "type",
                                DataType = "text",
                                IsNullable = false,
                                IsPrimaryKey = false,
                                IsForeignKey = false,
                                DefaultValue = "keyspace",
                                Description = await _openAIService.GenerarDescripcionColumnaAsync($"keyspace_{keyspaceName}", "type")
                            }
                        }
                    };

                    // Obtener tablas del keyspace
                    var tablesQuery = $"SELECT table_name, id FROM system_schema.tables WHERE keyspace_name = '{keyspaceName}'";
                    var tablesResult = await session.ExecuteAsync(new SimpleStatement(tablesQuery));

                    foreach (var tableRow in tablesResult)
                    {
                        var tableName = tableRow.GetValue<string>("table_name");
                        
                        // Obtener columnas de la tabla
                        var columnsQuery = $"SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = '{keyspaceName}' AND table_name = '{tableName}'";
                        var columnsResult = await session.ExecuteAsync(new SimpleStatement(columnsQuery));                        var tableSchema = new TableSchemaDto
                        {
                            TableName = $"{keyspaceName}.{tableName}",
                            TableDescription = await _openAIService.GenerarDescripcionTablaAsync(tableName, new List<string>()),
                            TablePurpose = await _openAIService.GenerarPropositoTablaAsync(tableName),
                            Columns = new List<ColumnSchemaDto>()
                        };                        foreach (var columnRow in columnsResult)
                        {
                            var columnName = columnRow.GetValue<string>("column_name");
                            var columnType = columnRow.GetValue<string>("type");
                            var columnKind = columnRow.GetValue<string>("kind");

                            tableSchema.Columns.Add(new ColumnSchemaDto
                            {
                                ColumnName = columnName,
                                DataType = columnType,
                                IsNullable = columnKind != "partition_key" && columnKind != "clustering",
                                IsPrimaryKey = columnKind == "partition_key" || columnKind == "clustering",
                                IsForeignKey = false,
                                DefaultValue = columnKind, // Usamos kind como información adicional
                                Description = await _openAIService.GenerarDescripcionColumnaAsync(tableName, columnName)
                            });
                        }

                        if (tableSchema.Columns.Any())
                        {
                            preview.Tables.Add(tableSchema);
                        }
                    }

                    if (keyspaceTable.Columns.Any())
                    {
                        preview.Tables.Add(keyspaceTable);
                    }
                }

                // Si no hay keyspaces específicos, crear información del cluster                if (!preview.Tables.Any())
                {
                    var clusterTable = new TableSchemaDto
                    {
                        TableName = "cassandra_cluster_info",
                        TableDescription = await _openAIService.GenerarDescripcionTablaAsync("cassandra_cluster_info", new List<string> { "cluster_name", "connection_status" }),
                        TablePurpose = await _openAIService.GenerarPropositoTablaAsync("cassandra_cluster_info"),
                        Columns = new List<ColumnSchemaDto>
                        {
                            new ColumnSchemaDto
                            {
                                ColumnName = "cluster_name",
                                DataType = "text",
                                IsNullable = false,
                                IsPrimaryKey = true,
                                IsForeignKey = false,
                                DefaultValue = "cassandra_cluster",
                                Description = await _openAIService.GenerarDescripcionColumnaAsync("cassandra_cluster_info", "cluster_name")
                            },
                            new ColumnSchemaDto
                            {
                                ColumnName = "connection_status",
                                DataType = "text",
                                IsNullable = false,
                                IsPrimaryKey = false,
                                IsForeignKey = false,
                                DefaultValue = "connected",
                                Description = await _openAIService.GenerarDescripcionColumnaAsync("cassandra_cluster_info", "connection_status")
                            }
                        }
                    };
                    preview.Tables.Add(clusterTable);
                }

                await session.ShutdownAsync();
                return preview;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al conectar con Cassandra: {ex.Message}", ex);
            }
        }
    }
}
