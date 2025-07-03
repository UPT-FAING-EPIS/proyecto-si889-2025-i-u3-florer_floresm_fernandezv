using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DataDicGen.Infrastructure.Services;

public class MongoDatabaseMetadataService : IDatabaseMetadataService
{
    private readonly IOpenAIService _openAIService;

    public MongoDatabaseMetadataService(IOpenAIService openAIService)
    {
        _openAIService = openAIService;
    }    public async Task<List<TableSchemaDto>> ObtenerDiccionarioAsync(DatabaseConnectionDto dto)
    {
        var resultado = new List<TableSchemaDto>();
        var authSource = string.IsNullOrWhiteSpace(dto.AuthSource) ? "admin" : dto.AuthSource;
        // Si se provee una cadena de conexión personalizada, usarla directamente
        string connectionString;
        if (!string.IsNullOrWhiteSpace(dto.ConnectionString))
        {
            connectionString = dto.ConnectionString;
            // Extraer el nombre de la base de datos de la cadena si no viene en dto.Database
            if (string.IsNullOrWhiteSpace(dto.Database))
            {
                var mongoUrl = new MongoUrl(connectionString);
                dto.Database = mongoUrl.DatabaseName;
            }
        }
        else
        {
            var port = dto.Port ?? 27017; // Puerto por defecto de MongoDB
            var serverWithPort = dto.Port.HasValue ? $"{dto.Server}:{port}" : dto.Server;
            connectionString = $"mongodb://{dto.User}:{dto.Password}@{serverWithPort}/{dto.Database}?authSource={authSource}";
        }
        var client = new MongoDB.Driver.MongoClient(connectionString);
        var db = client.GetDatabase(dto.Database);

        var collections = await db.ListCollectionNamesAsync();
        var collectionNames = await collections.ToListAsync();

        foreach (var collectionName in collectionNames)
        {
            var collection = db.GetCollection<BsonDocument>(collectionName);
            var sampleDocs = await collection.Find(new BsonDocument()).Limit(10).ToListAsync();

            var fieldTypes = new Dictionary<string, string>();
            foreach (var doc in sampleDocs)
            {
                foreach (var elem in doc.Elements)
                {
                    if (!fieldTypes.ContainsKey(elem.Name))
                        fieldTypes[elem.Name] = elem.Value.BsonType.ToString();
                }
            }

            var columnas = await Task.WhenAll(fieldTypes.Select(async f => new ColumnSchemaDto
{
    ColumnName = f.Key,
    DataType = f.Value,
    IsNullable = true,
    MaxLength = null,
    IsPrimaryKey = f.Key == "_id",
    IsForeignKey = false,
    Description = await _openAIService.GenerarDescripcionColumnaAsync(collectionName, f.Key)
}));

            var descripcionTabla = await _openAIService.GenerarDescripcionTablaAsync(collectionName, columnas.Select(c => c.ColumnName).ToList());
            var propositoTabla = await _openAIService.GenerarPropositoTablaAsync(collectionName);

            resultado.Add(new TableSchemaDto
            {
                TableName = collectionName,
                TableDescription = descripcionTabla,
                TablePurpose = propositoTabla,
                TableRelationships = "No relacional",
                Columns = columnas.ToList(),
                DmlInserts = string.Join("\n", sampleDocs.Select(d => d.ToJson())),
            });
        }

        return resultado;
    }
}
