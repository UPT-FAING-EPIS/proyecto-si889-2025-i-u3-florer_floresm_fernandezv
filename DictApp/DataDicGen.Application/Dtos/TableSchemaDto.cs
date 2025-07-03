public class TableSchemaDto
{
    public string TableName { get; set; }
    public string? TableDescription { get; set; } = ""; // Para IA
    public string? TablePurpose { get; set; } = "";     // Para IA
    public string? TableRelationships { get; set; } = "";// Para IA

    public List<ColumnSchemaDto> Columns { get; set; }

    public string DmlInserts { get; set; } = "";
public string DdlCreateScript { get; set; } = "";
public string StoredProcedures { get; set; } = "";
}

public class ColumnSchemaDto
{
    public string ColumnName { get; set; }
    public string DataType { get; set; }
    public bool IsNullable { get; set; }
    public int? MaxLength { get; set; }
    
    public bool IsPrimaryKey { get; set; }  // 👈 nuevo
    public bool IsForeignKey { get; set; }  // 👈 nuevo
    public string? Description { get; set; } = ""; // ← descripción IA
    public string? DefaultValue { get; set; } = ""; // Para información adicional (Redis, Cassandra)
}