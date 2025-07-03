namespace DataDicGen.Application.Dtos;

public class DatabasePreviewDto
{
    public string? DatabaseName { get; set; } // Para identificar la BD
    public List<TableSchemaDto> Tables { get; set; } = new();
    public DocumentMetadataDto Metadata { get; set; } = new();
}