public class DatabaseConnectionDto
{
    public string? Server { get; set; }         // Ej: sqlserver.ejemplo.com
    public string? Database { get; set; }       // Ej: MiBaseDatos
    public string? User { get; set; }           // Ej: admin_user
    public string? Password { get; set; }       // Contraseña
    public int? Port { get; set; }             // Puerto personalizado (opcional)
    public string? AuthSource { get; set; } = "admin"; // Para MongoDB
    
    // Propiedades específicas para Cassandra
    public string? Keyspace { get; set; }      // Para Cassandra
    public string? DataCenter { get; set; }    // Para Cassandra
    
    // Propiedades específicas para Redis
    public int? RedisDatabase { get; set; } = 0; // Para Redis (número de BD)
    public bool UseSsl { get; set; } = false;    // Para Redis/otros

    // NUEVO: Cadena de conexión personalizada (opcional)
    public string? ConnectionString { get; set; } // Si se provee, se usará directamente
}