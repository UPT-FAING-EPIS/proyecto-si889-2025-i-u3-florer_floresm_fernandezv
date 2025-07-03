namespace DataDicGen.Application.Dtos;

public class DocumentMetadataDto
{
    public string Title { get; set; } = "Diccionario de Datos";
    public string Description { get; set; } = "Diccionario de datos generado automáticamente";
    public bool IncludeDML { get; set; } = true;
    public bool IncludeDDL { get; set; } = true;
    public bool IncludeStoredProcedures { get; set; } = true;
}