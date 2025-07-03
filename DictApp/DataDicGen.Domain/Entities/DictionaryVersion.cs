using System;

namespace DataDicGen.Domain.Entities
{
    public class DictionaryVersion
    {
        public int Id { get; set; }
        public string UserId { get; set; } // Relaciona con el usuario
        public string DatabaseType { get; set; } // mysql, postgresql, etc
        public string DatabaseName { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string Content { get; set; } // JSON, XML, etc
        public int? VersionNumber { get; set; } // Opcional
        public string? Tag { get; set; } // Opcional, para etiquetas
    }
}
