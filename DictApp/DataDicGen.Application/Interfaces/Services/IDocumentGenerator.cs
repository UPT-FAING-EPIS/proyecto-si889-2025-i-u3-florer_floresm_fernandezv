
namespace DataDicGen.Application.Interfaces.Services;

public interface IDocumentGenerator
{
    byte[] GenerarDiccionarioPdf(List<TableSchemaDto> tablas);
    
    /// <summary>
    /// Genera un documento Word (DOCX) con el diccionario de datos
    /// </summary>
    /// <param name="tablas">Lista de tablas con sus metadatos</param>
    /// <returns>Array de bytes del documento Word generado</returns>
    byte[] GenerarDiccionarioWord(List<TableSchemaDto> tablas);
}