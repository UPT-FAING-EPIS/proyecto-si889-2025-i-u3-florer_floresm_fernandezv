export interface DatabaseConnectionDto {
  server: string;
  database: string;
  user: string;
  password: string;
  port?: number; // Puerto opcional
  authSource?: string; // Campo opcional para soportar la autenticación personalizada en MongoDB
  
  // Propiedades específicas para Cassandra
  keyspace?: string;      // Para Cassandra
  dataCenter?: string;    // Para Cassandra
  
  // Propiedades específicas para Redis
  redisDatabase?: number; // Para Redis (número de BD)
  useSsl?: boolean;       // Para Redis/otros
  // NUEVO: Cadena de conexión personalizada
  connectionString?: string;
}

export interface ConnectionResponseDto {
  token: string;
  message: string;
}

export interface ColumnSchemaDto {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  maxLength?: number;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  description?: string;
}

export interface TableSchemaDto {
  tableName: string;
  tableDescription?: string;
  tablePurpose?: string;
  tableRelationships?: string;
  columns: ColumnSchemaDto[];
  dmlInserts?: string;
  ddlCreateScript?: string;
  storedProcedures?: string;
}