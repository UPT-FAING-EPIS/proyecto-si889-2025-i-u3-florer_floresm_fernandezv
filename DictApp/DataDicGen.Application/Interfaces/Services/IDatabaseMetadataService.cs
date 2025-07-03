using System.Data;
using System.Data.Common;


namespace DataDicGen.Application.Interfaces.Services;

public interface IDatabaseMetadataService
{
    Task<List<TableSchemaDto>> ObtenerDiccionarioAsync(DatabaseConnectionDto dto);
}