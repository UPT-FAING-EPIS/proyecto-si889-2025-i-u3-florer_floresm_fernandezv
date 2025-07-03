import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  TableChart as TableIcon,
  ViewColumn as ColumnIcon,
  Key as KeyIcon,
  AccountTree as RelationIcon,
  DataObject as TypeIcon,
  Storage as DatabaseIcon,
  FileDownload as DownloadIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DatabaseMetrics {
  tables: any[];
  databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver' | 'redis' | 'cassandra'; // Tipo de BD
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value.toLocaleString()}
          </Typography>
          <Typography variant="h6" color="text.primary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: color, fontSize: '3rem' }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#e91e63', '#9c27b0', '#2196f3', '#ff9800'];

export const DatabaseMetrics: React.FC<DatabaseMetrics> = ({ tables, databaseType = 'mysql' }) => {  const metrics = useMemo(() => {
    // Detectar tipo de BD si no se especifica
    const isNoSQL = ['mongodb', 'redis', 'cassandra'].includes(databaseType);
    const isRelational = ['mysql', 'postgresql', 'sqlserver'].includes(databaseType);
    
    // Métricas básicas
    const totalTables = tables.length;
    const totalColumns = tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0);
    
    // Métricas específicas para BD relacionales
    const totalPrimaryKeys = isRelational ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.isPrimaryKey).length || 0), 0
    ) : 0;
    
    const totalForeignKeys = isRelational ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.isForeignKey).length || 0), 0
    ) : 0;    // Para MongoDB, contamos documentos únicos con _id
    const totalDocumentIds = databaseType === 'mongodb' ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.columnName === '_id').length || 0), 0
    ) : 0;

    // Para Redis, contamos tipos de datos específicos
    const totalRedisKeys = databaseType === 'redis' ? tables.reduce((sum, table) => 
      sum + (table.columns?.length || 0), 0
    ) : 0;

    // Para Cassandra, contamos partition keys y clustering keys
    const totalPartitionKeys = databaseType === 'cassandra' ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.defaultValue === 'partition_key').length || 0), 0
    ) : 0;

    const totalClusteringKeys = databaseType === 'cassandra' ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.defaultValue === 'clustering').length || 0), 0
    ) : 0;

    // Análisis de tipos de datos
    const dataTypes: { [key: string]: number } = {};
    const nullableColumns = tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.isNullable).length || 0), 0
    );
    
    tables.forEach(table => {
      table.columns?.forEach((col: any) => {
        const type = col.dataType?.toLowerCase().split('(')[0] || 'unknown';
        dataTypes[type] = (dataTypes[type] || 0) + 1;
      });
    });

    const dataTypesChart = Object.entries(dataTypes)
      .map(([type, count]) => ({ 
        name: type.charAt(0).toUpperCase() + type.slice(1), 
        value: count,
        percentage: totalColumns > 0 ? ((count / totalColumns) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 tipos    // Distribución de columnas por tabla
    const columnDistribution = tables.map(table => {
      const baseData = {
        name: table.tableName.length > 15 ? table.tableName.substring(0, 15) + '...' : table.tableName,
        fullName: table.tableName,
        columns: table.columns?.length || 0,
      };

      if (isNoSQL) {
        // Para MongoDB: _id, objetos y arrays
        return {
          ...baseData,
          ids: table.columns?.filter((col: any) => col.columnName === '_id').length || 0,
          objects: table.columns?.filter((col: any) => col.dataType?.toLowerCase().includes('object')).length || 0,
          arrays: table.columns?.filter((col: any) => col.dataType?.toLowerCase().includes('array')).length || 0,
          nullable: table.columns?.filter((col: any) => col.isNullable).length || 0,
        };
      } else {
        // Para BD relacionales: PK y FK
        return {
          ...baseData,
          pk: table.columns?.filter((col: any) => col.isPrimaryKey).length || 0,
          fk: table.columns?.filter((col: any) => col.isForeignKey).length || 0,
          nullable: table.columns?.filter((col: any) => col.isNullable).length || 0,
        };
      }
    }).sort((a, b) => b.columns - a.columns).slice(0, 12); // Top 12 tablas

    // Estadísticas adicionales
    const avgColumnsPerTable = totalTables > 0 ? Math.round((totalColumns / totalTables) * 10) / 10 : 0;
    const tablesWithPK = tables.filter(table => 
      table.columns?.some((col: any) => col.isPrimaryKey)
    ).length;
    const tablesWithFK = tables.filter(table => 
      table.columns?.some((col: any) => col.isForeignKey)
    ).length;    // Estadísticas de calidad de datos
    const maxColumns = Math.max(...tables.map(t => t.columns?.length || 0), 0);
    const minColumns = Math.min(...tables.map(t => t.columns?.length || 0).filter(c => c > 0), 0) || 0;
    const tablesWithoutPK = totalTables - tablesWithPK;
    const relationshipDensity = totalTables > 0 ? ((totalForeignKeys / totalTables) * 100).toFixed(1) : '0';

    // Métricas específicas para NoSQL
    const totalObjectFields = isNoSQL ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.dataType?.toLowerCase().includes('object')).length || 0), 0
    ) : 0;
    
    const totalArrayFields = isNoSQL ? tables.reduce((sum, table) => 
      sum + (table.columns?.filter((col: any) => col.dataType?.toLowerCase().includes('array')).length || 0), 0
    ) : 0;    return {
      totalTables,
      totalColumns,
      totalPrimaryKeys,
      totalForeignKeys,
      totalDocumentIds,
      totalRedisKeys,
      totalPartitionKeys,
      totalClusteringKeys,
      nullableColumns,
      avgColumnsPerTable,
      tablesWithPK,
      tablesWithFK,
      tablesWithoutPK,
      dataTypesChart,
      columnDistribution,
      dataTypes: Object.keys(dataTypes).length,
      maxColumns,
      minColumns,
      relationshipDensity,
      totalObjectFields,
      totalArrayFields,
      isNoSQL,
      isRelational,
      databaseType
    };
  }, [tables]);

  const exportMetricsToJSON = (metrics: any) => {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTables: metrics.totalTables,
        totalColumns: metrics.totalColumns,
        totalPrimaryKeys: metrics.totalPrimaryKeys,
        totalForeignKeys: metrics.totalForeignKeys,
        avgColumnsPerTable: metrics.avgColumnsPerTable,
        dataTypesCount: metrics.dataTypes,
        nullableColumns: metrics.nullableColumns,
        relationshipDensity: metrics.relationshipDensity
      },
      dataTypes: metrics.dataTypesChart,
      tablesDistribution: metrics.columnDistribution,
      qualityMetrics: {
        tablesWithPK: metrics.tablesWithPK,
        tablesWithFK: metrics.tablesWithFK,
        tablesWithoutPK: metrics.tablesWithoutPK,
        pkCoverage: (metrics.tablesWithPK / metrics.totalTables) * 100,
        nullablePercentage: (metrics.nullableColumns / metrics.totalColumns) * 100
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMetricsToCSV = (metrics: any) => {
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Tablas', metrics.totalTables],
      ['Total de Columnas', metrics.totalColumns],
      ['Claves Primarias', metrics.totalPrimaryKeys],
      ['Claves Foráneas', metrics.totalForeignKeys],
      ['Promedio Columnas/Tabla', metrics.avgColumnsPerTable],
      ['Tipos de Datos Únicos', metrics.dataTypes],
      ['Columnas Nullable', metrics.nullableColumns],
      ['Densidad de Relaciones (%)', metrics.relationshipDensity],
      ['Cobertura de PK (%)', ((metrics.tablesWithPK / metrics.totalTables) * 100).toFixed(1)],
      ['Porcentaje Nullable (%)', ((metrics.nullableColumns / metrics.totalColumns) * 100).toFixed(1)]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // Health Score Calculator
  const calculateHealthScore = (metrics: any): { score: number; level: string; color: string; recommendations: string[] } => {
    let score = 0;
    const recommendations: string[] = [];
    const isNoSQL = metrics.isNoSQL;

    if (isNoSQL) {
      // Health Score para NoSQL (MongoDB)
      
      // Document ID Coverage (25%)
      const idCoverage = (metrics.totalDocumentIds / metrics.totalTables) * 100;
      if (idCoverage >= 100) score += 25;
      else if (idCoverage >= 90) score += 20;
      else if (idCoverage >= 70) score += 15;
      else score += 10;

      if (idCoverage < 100) {
        recommendations.push(`Verificar que todas las colecciones tengan documentos con _id`);
      }

      // Schema Flexibility (25%) - Balance entre campos object y array
      const flexibilityRatio = metrics.totalColumns > 0 ? 
        ((metrics.totalObjectFields + metrics.totalArrayFields) / metrics.totalColumns) * 100 : 0;
      if (flexibilityRatio >= 20 && flexibilityRatio <= 60) score += 25;
      else if (flexibilityRatio >= 10 && flexibilityRatio <= 80) score += 20;
      else if (flexibilityRatio >= 5 && flexibilityRatio <= 90) score += 15;
      else score += 10;

      if (flexibilityRatio < 10) {
        recommendations.push('Considerar usar más subdocumentos y arrays para aprovechar NoSQL');
      } else if (flexibilityRatio > 80) {
        recommendations.push('Esquema muy complejo, considerar simplificar estructura');
      }

      // Data Type Diversity (20%)
      const typesDiversity = metrics.dataTypes;
      if (typesDiversity >= 6) score += 20;
      else if (typesDiversity >= 4) score += 15;
      else if (typesDiversity >= 3) score += 12;
      else score += 8;

      // Collection Size Balance (20%)
      const avgFields = metrics.avgColumnsPerTable;
      if (avgFields >= 5 && avgFields <= 20) score += 20;
      else if (avgFields >= 3 && avgFields <= 30) score += 15;
      else score += 10;

      if (avgFields > 30) {
        recommendations.push('Colecciones con muchos campos, considerar normalización');
      }

      // Schema Consistency (10%)
      if (metrics.totalTables > 1) {
        score += 10; // Bonus por tener múltiples colecciones organizadas
      } else {
        score += 5;
      }

    } else {
      // Health Score para BD Relacionales (original)
      
      // Primary Key Coverage (30%)
      const pkCoverage = (metrics.tablesWithPK / metrics.totalTables) * 100;
      if (pkCoverage >= 100) score += 30;
      else if (pkCoverage >= 90) score += 25;
      else if (pkCoverage >= 70) score += 20;
      else if (pkCoverage >= 50) score += 15;
      else score += 10;

      if (pkCoverage < 100) {
        recommendations.push(`Agregar claves primarias a ${metrics.tablesWithoutPK} tabla(s)`);
      }

      // Relationship Density (25%)
      const relationshipDensity = parseFloat(metrics.relationshipDensity);
      if (relationshipDensity >= 50) score += 25;
      else if (relationshipDensity >= 30) score += 20;
      else if (relationshipDensity >= 15) score += 15;
      else if (relationshipDensity >= 5) score += 10;
      else score += 5;

      if (relationshipDensity < 15 && metrics.totalTables > 1) {
        recommendations.push('Considerar agregar más relaciones entre tablas');
      }

      // Data Type Diversity (20%)
      const typesDiversity = metrics.dataTypes;
      if (typesDiversity >= 8) score += 20;
      else if (typesDiversity >= 6) score += 15;
      else if (typesDiversity >= 4) score += 12;
      else if (typesDiversity >= 2) score += 8;
      else score += 5;

      // Nullable Percentage (15%)
      const nullablePercentage = (metrics.nullableColumns / metrics.totalColumns) * 100;
      if (nullablePercentage <= 30) score += 15;
      else if (nullablePercentage <= 50) score += 12;
      else if (nullablePercentage <= 70) score += 8;
      else score += 5;

      if (nullablePercentage > 70) {
        recommendations.push('Revisar campos nullable excesivos');
      }

      // Table Size Balance (10%)
      const avgColumns = metrics.avgColumnsPerTable;
      if (avgColumns >= 5 && avgColumns <= 15) score += 10;
      else if (avgColumns >= 3 && avgColumns <= 20) score += 8;
      else score += 5;

      if (avgColumns > 20) {
        recommendations.push('Considerar normalizar tablas con muchas columnas');
      }
    }

    // Determine level and color
    let level: string;
    let color: string;
    
    if (score >= 85) {
      level = 'Excelente';
      color = '#4caf50';
    } else if (score >= 70) {
      level = 'Bueno';
      color = '#8bc34a';
    } else if (score >= 55) {
      level = 'Regular';
      color = '#ff9800';
    } else if (score >= 40) {
      level = 'Necesita Mejoras';
      color = '#ff5722';
    } else {
      level = 'Crítico';
      color = '#f44336';
    }

    return { score, level, color, recommendations };
  };
  const healthScore = useMemo(() => calculateHealthScore(metrics), [metrics]);

  if (tables.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          No hay datos para mostrar métricas
        </Typography>
      </Box>
    );
  }    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              📊 Dashboard de Métricas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análisis estadístico de la estructura de la base de datos
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportMetricsToJSON(metrics)}
              size="small"
            >
              JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => exportMetricsToCSV(metrics)}
              size="small"
            >
              CSV
            </Button>
          </Box>
        </Box>        {/* Resumen Ejecutivo */}
        <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${healthScore.color}15 0%, ${healthScore.color}05 100%)` }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 Resumen Ejecutivo
              </Typography>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="bold" sx={{ color: healthScore.color }}>
                  {healthScore.score}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Health Score
                </Typography>
                <Typography variant="body2" sx={{ color: healthScore.color, fontWeight: 'bold' }}>
                  {healthScore.level}
                </Typography>
              </Box>
            </Box>            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              {metrics.isRelational ? (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Integridad</Typography>
                    <Typography variant="h6" color="primary">
                      {((metrics.tablesWithPK / metrics.totalTables) * 100).toFixed(0)}% con PK
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Relaciones</Typography>
                    <Typography variant="h6" color="primary">
                      {metrics.relationshipDensity}% densidad
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">IDs de Documento</Typography>
                    <Typography variant="h6" color="primary">
                      {metrics.totalDocumentIds} campos _id
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Estructura</Typography>
                    <Typography variant="h6" color="primary">
                      {metrics.totalObjectFields} objetos anidados
                    </Typography>
                  </Box>
                </>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">Diversidad</Typography>
                <Typography variant="h6" color="primary">
                  {metrics.dataTypes} tipos únicos
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Estructura</Typography>
                <Typography variant="h6" color="primary">
                  {metrics.avgColumnsPerTable} {metrics.isNoSQL ? 'campos/colección' : 'col/tabla'}
                </Typography>
              </Box>
            </Box>
            {healthScore.recommendations.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  💡 Recomendaciones:
                </Typography>
                {healthScore.recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    • {rec}
                  </Typography>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>        {/* Alertas y Recomendaciones */}
        {(
          (metrics.isRelational && (metrics.tablesWithoutPK > 0 || (metrics.nullableColumns / metrics.totalColumns) > 0.7)) ||
          (metrics.isNoSQL && (metrics.totalDocumentIds < metrics.totalTables || metrics.totalObjectFields === 0))
        ) && (
          <Card sx={{ mb: 4, border: '1px solid #ff9800' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚠️ Recomendaciones
              </Typography>
              <Box sx={{ mt: 2 }}>
                {metrics.isRelational ? (
                  <>
                    {metrics.tablesWithoutPK > 0 && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • {metrics.tablesWithoutPK} tabla(s) sin clave primaria. Se recomienda agregar PKs para mejorar la integridad.
                      </Typography>
                    )}
                    {(metrics.nullableColumns / metrics.totalColumns) > 0.7 && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Alto porcentaje de campos nullable ({((metrics.nullableColumns / metrics.totalColumns) * 100).toFixed(1)}%). Considere revisar la necesidad de valores nulos.
                      </Typography>
                    )}
                    {metrics.totalForeignKeys === 0 && metrics.totalTables > 1 && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • No se detectaron claves foráneas. Verifique si las relaciones están correctamente definidas.
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    {metrics.totalDocumentIds < metrics.totalTables && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Algunas colecciones pueden no tener documentos con _id. Verifique la estructura de documentos.
                      </Typography>
                    )}
                    {metrics.totalObjectFields === 0 && metrics.totalTables > 0 && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • No se detectaron campos de tipo objeto. Considere usar subdocumentos para aprovechar NoSQL.
                      </Typography>
                    )}
                    {metrics.totalArrayFields === 0 && metrics.totalTables > 0 && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • No se detectaron campos de tipo array. Los arrays pueden mejorar la estructura de datos NoSQL.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        )}{/* Métricas principales */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
        gap={3} 
        sx={{ mb: 4 }}
      >
        <MetricCard
          title={metrics.isNoSQL ? "Colecciones" : "Tablas"}
          value={metrics.totalTables}
          icon={<TableIcon />}
          color="#2196f3"
          subtitle={metrics.isNoSQL ? "Total de colecciones" : "Total de tablas en la BD"}
        />
        <MetricCard
          title={metrics.isNoSQL ? "Campos" : "Columnas"}
          value={metrics.totalColumns}
          icon={<ColumnIcon />}
          color="#4caf50"
          subtitle={`Promedio: ${metrics.avgColumnsPerTable} por ${metrics.isNoSQL ? 'colección' : 'tabla'}`}
        />
          {metrics.isRelational ? (
          <>
            <MetricCard
              title="Claves Primarias"
              value={metrics.totalPrimaryKeys}
              icon={<KeyIcon />}
              color="#ff9800"
              subtitle={`${metrics.tablesWithPK} tablas con PK`}
            />
            <MetricCard
              title="Claves Foráneas"
              value={metrics.totalForeignKeys}
              icon={<RelationIcon />}
              color="#e91e63"
              subtitle={`${metrics.tablesWithFK} tablas con FK`}
            />
          </>
        ) : metrics.databaseType === 'mongodb' ? (
          <>
            <MetricCard
              title="IDs de Documento"
              value={metrics.totalDocumentIds}
              icon={<KeyIcon />}
              color="#ff9800"
              subtitle="Campos _id encontrados"
            />
            <MetricCard
              title="Campos Objeto"
              value={metrics.totalObjectFields}
              icon={<RelationIcon />}
              color="#e91e63"
              subtitle="Campos de tipo objeto/subdocumento"
            />
          </>        ) : metrics.databaseType === 'redis' ? (
          <>
            <MetricCard
              title="Claves Redis"
              value={metrics.totalRedisKeys}
              icon={<KeyIcon />}
              color="#ff9800"
              subtitle="Total de claves almacenadas"
            />
            <MetricCard
              title="Estructuras"
              value={metrics.dataTypes}
              icon={<RelationIcon />}
              color="#e91e63"
              subtitle="Tipos Redis (string, hash, list, etc.)"
            />
          </>
        ): metrics.databaseType === 'cassandra' ? (
          <>
            <MetricCard
              title="Partition Keys"
              value={metrics.totalPartitionKeys}
              icon={<KeyIcon />}
              color="#ff9800"
              subtitle="Claves de partición"
            />
            <MetricCard
              title="Clustering Keys"
              value={metrics.totalClusteringKeys}
              icon={<RelationIcon />}
              color="#e91e63"
              subtitle="Claves de clustering"
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Campos Especiales"
              value={0}
              icon={<KeyIcon />}
              color="#ff9800"
              subtitle="No detectados"
            />
            <MetricCard
              title="Relaciones"
              value={0}
              icon={<RelationIcon />}
              color="#e91e63"
              subtitle="No detectadas"
            />
          </>
        )}
        
        <MetricCard
          title="Tipos de Datos"
          value={metrics.dataTypes}
          icon={<TypeIcon />}
          color="#9c27b0"
          subtitle="Tipos únicos utilizados"
        />
        
        {metrics.isRelational ? (
          <MetricCard
            title="Campos Nulos"
            value={metrics.nullableColumns}
            icon={<DatabaseIcon />}
            color="#607d8b"
            subtitle={`${((metrics.nullableColumns / metrics.totalColumns) * 100).toFixed(1)}% del total`}
          />
        ) : (
          <MetricCard
            title="Campos Array"
            value={metrics.totalArrayFields}
            icon={<DatabaseIcon />}
            color="#607d8b"
            subtitle="Campos de tipo array/lista"
          />
        )}
      </Box>        {/* Estadísticas adicionales */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={3} sx={{ mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              🔍 {metrics.isNoSQL ? 'Calidad de la Estructura NoSQL' : 'Calidad de la Base de Datos'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {metrics.isRelational ? (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2">Cobertura de Claves Primarias</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.totalTables > 0 ? Math.round((metrics.tablesWithPK / metrics.totalTables) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.totalTables > 0 ? (metrics.tablesWithPK / metrics.totalTables) * 100 : 0}
                    sx={{ mb: 3 }}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2">Tablas con Relaciones</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.totalTables > 0 ? Math.round((metrics.tablesWithFK / metrics.totalTables) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.totalTables > 0 ? (metrics.tablesWithFK / metrics.totalTables) * 100 : 0}
                    sx={{ mb: 3 }}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2">Columnas Nullable</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.totalColumns > 0 ? ((metrics.nullableColumns / metrics.totalColumns) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.totalColumns > 0 ? (metrics.nullableColumns / metrics.totalColumns) * 100 : 0}
                    sx={{ mb: 3 }}
                  />
                </>
              ) : (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2">Cobertura de IDs de Documento</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.totalTables > 0 ? Math.round((metrics.totalDocumentIds / metrics.totalTables) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.totalTables > 0 ? (metrics.totalDocumentIds / metrics.totalTables) * 100 : 0}
                    sx={{ mb: 3 }}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2">Campos de Tipo Objeto</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.totalColumns > 0 ? ((metrics.totalObjectFields / metrics.totalColumns) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.totalColumns > 0 ? (metrics.totalObjectFields / metrics.totalColumns) * 100 : 0}
                    sx={{ mb: 3 }}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2">Campos de Tipo Array</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.totalColumns > 0 ? ((metrics.totalArrayFields / metrics.totalColumns) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.totalColumns > 0 ? (metrics.totalArrayFields / metrics.totalColumns) * 100 : 0}
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<TypeIcon />} 
                  label={`${metrics.dataTypes} tipos únicos`} 
                  variant="outlined" 
                  size="small"
                />
                {metrics.isRelational ? (
                  <Chip 
                    icon={<DatabaseIcon />} 
                    label={`${metrics.relationshipDensity}% densidad FK`} 
                    variant="outlined" 
                    size="small"
                  />
                ) : (
                  <Chip 
                    icon={<DatabaseIcon />} 
                    label={`${metrics.totalObjectFields + metrics.totalArrayFields} campos complejos`} 
                    variant="outlined" 
                    size="small"
                  />
                )}
                <Chip 
                  label={`${metrics.minColumns}-${metrics.maxColumns} rango ${metrics.isNoSQL ? 'campos' : 'columnas'}`} 
                  variant="outlined" 
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card><Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📈 Distribución de Tipos de Datos
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.dataTypesChart}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {metrics.dataTypesChart.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} columnas (${props.payload.percentage}%)`,
                    `Tipo ${name}`
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>      {/* Gráfico de distribución de columnas */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            📊 Distribución de {metrics.isNoSQL ? 'Campos por Colección' : 'Columnas por Tabla'} (Top 12)
          </Typography>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={metrics.columnDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
                interval={0}
              />
              <YAxis />              <Tooltip 
                formatter={(value, name) => {
                  const labels: { [key: string]: string } = metrics.isNoSQL ? {
                    columns: 'Total Campos',
                    ids: 'Campos _id',
                    objects: 'Campos Objeto',
                    arrays: 'Campos Array',
                    nullable: 'Campos Opcionales'
                  } : {
                    columns: 'Total Columnas',
                    pk: 'Claves Primarias',
                    fk: 'Claves Foráneas',
                    nullable: 'Campos Nullable'
                  };
                  return [value, labels[name as string] || name];
                }}
                labelFormatter={(label) => {
                  const item = metrics.columnDistribution.find(d => d.name === label);
                  return item ? `${metrics.isNoSQL ? 'Colección' : 'Tabla'}: ${item.fullName}` : label;
                }}
              />              <Legend 
                formatter={(value) => {
                  const labels: { [key: string]: string } = metrics.isNoSQL ? {
                    columns: 'Total Campos',
                    ids: 'Campos _id',
                    objects: 'Campos Objeto',
                    arrays: 'Campos Array',
                    nullable: 'Campos Opcionales'
                  } : {
                    columns: 'Total Columnas',
                    pk: 'Claves Primarias',
                    fk: 'Claves Foráneas',
                    nullable: 'Campos Nullable'
                  };
                  return labels[value] || value;
                }}
              />              <Bar dataKey="columns" fill="#2196f3" name="columns" />
              {metrics.isNoSQL ? (
                <>
                  <Bar dataKey="ids" fill="#ff9800" name="ids" />
                  <Bar dataKey="objects" fill="#e91e63" name="objects" />
                  <Bar dataKey="arrays" fill="#9c27b0" name="arrays" />
                </>
              ) : (
                <>
                  <Bar dataKey="pk" fill="#ff9800" name="pk" />
                  <Bar dataKey="fk" fill="#e91e63" name="fk" />
                </>
              )}
              <Bar dataKey="nullable" fill="#607d8b" name="nullable" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
