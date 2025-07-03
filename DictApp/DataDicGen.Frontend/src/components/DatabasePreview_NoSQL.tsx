import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Description as WordIcon
} from '@mui/icons-material';
import { ERDiagram } from './ERDiagram';
import { GlobalSearch } from './GlobalSearch';
import { DatabaseMetrics } from './DatabaseMetrics';
import { apiService } from '../services/api-service';

interface DatabasePreviewProps {
  preview: any;
  onExport: (data: any) => Promise<void>;
  onBack: () => void;
  databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver' | 'redis' | 'cassandra';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const DatabasePreview: React.FC<DatabasePreviewProps> = ({
  preview: initialPreview,
  onExport,
  onBack,
  databaseType = 'mysql'
}) => {
  const [preview, setPreview] = useState(initialPreview);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [filteredTables, setFilteredTables] = useState(initialPreview.tables);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Determinar si es NoSQL
  const isNoSQL = ['mongodb', 'redis', 'cassandra'].includes(databaseType);
  
  // Terminología adaptativa
  const terminology = {
    tables: isNoSQL ? 'Colecciones' : 'Tablas',
    table: isNoSQL ? 'Colección' : 'Tabla',
    columns: isNoSQL ? 'Campos' : 'Columnas',
    column: isNoSQL ? 'Campo' : 'Columna'
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchResults = (searchResults: any[]) => {
    setFilteredTables(searchResults);
  };

  const handleTableChange = (tableIndex: number, field: string, value: string) => {
    const updatedTables = [...preview.tables];
    updatedTables[tableIndex] = {
      ...updatedTables[tableIndex],
      [field]: value
    };
    setPreview({ ...preview, tables: updatedTables });
  };

  const handleColumnChange = (tableIndex: number, columnIndex: number, value: string) => {
    const updatedTables = [...preview.tables];
    updatedTables[tableIndex].columns[columnIndex].description = value;
    setPreview({ ...preview, tables: updatedTables });
  };

  const handleDeleteTable = (tableIndex: number, tableName: string) => {
    const itemType = isNoSQL ? 'colección' : 'tabla';
    if (window.confirm(`¿Está seguro que desea eliminar la ${itemType} "${tableName}" del diccionario?`)) {
      const updatedTables = preview.tables.filter((_: any, index: number) => index !== tableIndex);
      setPreview({ ...preview, tables: updatedTables });
      showSnackbar(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} "${tableName}" eliminada del diccionario`);
      
      if (editingTable === tableName) {
        setEditingTable(null);
      }
    }
  };

  const handleRestoreAllTables = () => {
    const itemType = isNoSQL ? 'colecciones' : 'tablas';
    if (window.confirm(`¿Desea restaurar todas las ${itemType} originales?`)) {
      setPreview(initialPreview);
      setEditingTable(null);
      showSnackbar(`Todas las ${itemType} han sido restauradas`);
    }
  };

  const handleMetadataChange = (field: string, value: any) => {
    setPreview({
      ...preview,
      metadata: { ...preview.metadata, [field]: value }
    });
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(preview);
      showSnackbar('PDF exportado exitosamente');
    } catch (error) {
      showSnackbar('Error al exportar PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportWord = async () => {
    setExportingWord(true);
    try {
      const wordBlob = await apiService.exportWord(preview);
      const url = window.URL.createObjectURL(wordBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'diccionario_datos.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Word exportado exitosamente');
    } catch (error) {
      showSnackbar('Error al exportar Word', 'error');
    } finally {
      setExportingWord(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderTableCard = (table: any, tableIndex: number) => {
    const isEditing = editingTable === table.tableName;

    return (
      <Card key={table.tableName} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {isNoSQL ? '📄' : '📋'} {table.tableName}
            </Typography>
            <Box>
              <IconButton
                onClick={() => setEditingTable(isEditing ? null : table.tableName)}
                color={isEditing ? "primary" : "default"}
                size="small"
              >
                {isEditing ? <VisibilityIcon /> : <EditIcon />}
              </IconButton>
              <IconButton
                onClick={() => handleDeleteTable(tableIndex, table.tableName)}
                color="error"
                size="small"
                title={`Eliminar ${terminology.table.toLowerCase()} del diccionario`}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Descripción de la {terminology.table}:
              </Typography>
              {isEditing ? (
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={table.tableDescription || ''}
                  onChange={(e) => handleTableChange(tableIndex, 'tableDescription', e.target.value)}
                  placeholder={`Descripción de la ${terminology.table.toLowerCase()}...`}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {table.tableDescription || 'Sin descripción'}
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Propósito:</Typography>
              {isEditing ? (
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={table.tablePurpose || ''}
                  onChange={(e) => handleTableChange(tableIndex, 'tablePurpose', e.target.value)}
                  placeholder={`Propósito de la ${terminology.table.toLowerCase()}...`}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {table.tablePurpose || 'Sin propósito definido'}
                </Typography>
              )}
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={50}>Nº</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  {!isNoSQL && <TableCell>Nulo</TableCell>}
                  {!isNoSQL && <TableCell>PK</TableCell>}
                  {!isNoSQL && <TableCell>FK</TableCell>}
                  {isNoSQL && <TableCell>Ejemplo</TableCell>}
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.columns.map((column: any, columnIndex: number) => (
                  <TableRow key={columnIndex}>
                    <TableCell>{columnIndex + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={column.isPrimaryKey ? 'bold' : 'normal'}>
                        {column.columnName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isNoSQL ? 'primary' : 'text.primary'}>
                        {column.dataType}
                      </Typography>
                    </TableCell>
                    {!isNoSQL && <TableCell>{column.isNullable ? 'Sí' : 'No'}</TableCell>}
                    {!isNoSQL && <TableCell>{column.isPrimaryKey ? '🔑' : ''}</TableCell>}
                    {!isNoSQL && <TableCell>{column.isForeignKey ? '🔗' : ''}</TableCell>}
                    {isNoSQL && (
                      <TableCell>
                        <Typography variant="body2" fontSize="11px" color="text.secondary">
                          {column.defaultValue || 'N/A'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          multiline
                          rows={2}
                          fullWidth
                          value={column.description || ''}
                          onChange={(e) => handleColumnChange(tableIndex, columnIndex, e.target.value)}
                          placeholder={`Descripción del ${terminology.column.toLowerCase()}...`}
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" fontSize="12px">
                          {column.description || 'Sin descripción'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Sección específica para NoSQL: Ejemplos de documentos */}
          {isNoSQL && table.dmlInserts && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                📄 Ejemplo de Documento:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography
                  component="pre"
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {table.dmlInserts.split('\n')[0]}
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <GlobalSearch tables={preview.tables || []} onSearchResults={handleSearchResults} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          📄 Vista Previa del Diccionario {isNoSQL ? 'NoSQL' : 'SQL'}
        </Typography>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
            size="large"
            sx={{ mr: 1 }}
          >
            {loading ? 'Generando...' : 'Exportar PDF'}
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<WordIcon />}
            onClick={handleExportWord}
            disabled={exportingWord}
            size="large"
          >
            {exportingWord ? 'Generando...' : 'Convertir a Word'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="🗂️ Metadatos" />
          <Tab label="📊 Métricas" />
          {!isNoSQL && <Tab label="🌐 Diagrama ER" />}
          <Tab label={`${isNoSQL ? '📄' : '📋'} ${terminology.tables} (${filteredTables?.length || 0})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Información del Documento {isNoSQL ? 'NoSQL' : 'SQL'}
            </Typography>
            
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>Título:</Typography>
              <TextField
                fullWidth
                value={preview.metadata?.title || ''}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="Título del documento..."
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>Descripción:</Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={preview.metadata?.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="Descripción del documento..."
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>⚙️ Opciones de Exportación</Typography>
            {/* Opciones específicas para SQL */}
            {!isNoSQL && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preview.metadata?.includeDML || false}
                      onChange={(e) => handleMetadataChange('includeDML', e.target.checked)}
                    />
                  }
                  label="Incluir sentencias DML (INSERT, UPDATE, DELETE)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preview.metadata?.includeDDL || false}
                      onChange={(e) => handleMetadataChange('includeDDL', e.target.checked)}
                    />
                  }
                  label="Incluir sentencias DDL (CREATE, ALTER, DROP)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preview.metadata?.includeStoredProcedures || false}
                      onChange={(e) => handleMetadataChange('includeStoredProcedures', e.target.checked)}
                    />
                  }
                  label="Incluir procedimientos almacenados"
                />
              </>
            )}
            {/* Opciones específicas para NoSQL */}
            {isNoSQL && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preview.metadata?.includeExamples || true}
                      onChange={(e) => handleMetadataChange('includeExamples', e.target.checked)}
                    />
                  }
                  label="Incluir ejemplos de documentos JSON"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preview.metadata?.includeIndexes || true}
                      onChange={(e) => handleMetadataChange('includeIndexes', e.target.checked)}
                    />
                  }
                  label="Incluir información de índices"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preview.metadata?.includeQueries || true}
                      onChange={(e) => handleMetadataChange('includeQueries', e.target.checked)}
                    />
                  }
                  label="Incluir consultas típicas"
                />
              </>
            )}

            <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">Gestión de {terminology.tables}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {terminology.tables} incluidas: {preview.tables?.length || 0}
                    {initialPreview.tables.length !== preview.tables?.length && 
                      ` (${initialPreview.tables.length - preview.tables.length} eliminadas)`
                    }
                  </Typography>
                </Box>
                <Button
                  onClick={handleRestoreAllTables}
                  variant="outlined"
                  size="small"
                  disabled={initialPreview.tables.length === preview.tables?.length}
                >
                  Restaurar Todas
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DatabaseMetrics tables={filteredTables || []} databaseType={databaseType} />
      </TabPanel>

      {!isNoSQL && (
        <TabPanel value={tabValue} index={2}>
          <ERDiagram tables={filteredTables || []} />
        </TabPanel>
      )}

      <TabPanel value={tabValue} index={isNoSQL ? 2 : 3}>
        <Box>
          {filteredTables?.map((table: any, index: number) => renderTableCard(table, index))}
        </Box>
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
