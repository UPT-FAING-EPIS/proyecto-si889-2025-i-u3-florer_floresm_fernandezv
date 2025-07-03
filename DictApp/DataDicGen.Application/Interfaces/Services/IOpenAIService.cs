

namespace DataDicGen.Application.Interfaces.Services;

public interface IOpenAIService
{
    Task<string> GenerarDescripcionTablaAsync(string tabla, List<string> columnas);
    Task<string> GenerarDescripcionColumnaAsync(string tabla, string columna);
    Task<string> GenerarPropositoTablaAsync(string tabla);
    Task<string> GenerarInsertDeEjemploConIAAsync(string tabla, List<ColumnSchemaDto> columnas);
}