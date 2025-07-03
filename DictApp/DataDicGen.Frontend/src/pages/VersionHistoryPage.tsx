import React, { useEffect, useState } from 'react';
import { versionService } from '../services/version-service';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface VersionItem {
  id: number;
  databaseType: string;
  databaseName: string;
  generatedAt: string;
  versionNumber?: number;
  tag?: string;
}

interface VersionHistoryPageProps {
  userId: string;
}

const VersionHistoryPage: React.FC<VersionHistoryPageProps> = ({ userId }) => {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);

  useEffect(() => {
    setLoading(true);
    versionService.getVersions(userId)
      .then(setVersions)
      .catch(() => setError('Error al cargar el historial de versiones'))
      .finally(() => setLoading(false));
  }, [userId]);

  // Renderizado amigable del contenido de la versión
  const renderVersionContent = (content: any) => {
    let parsed;
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      return <Alert severity="error">No se pudo interpretar el contenido</Alert>;
    }
    if (!parsed || !parsed.Tables) {
      return <Alert severity="info">No hay información de tablas para mostrar.</Alert>;
    }
    return (
      <Box>
        <Typography variant="h6" gutterBottom>{parsed.Metadata?.Title || 'Diccionario de Datos'}</Typography>
        <Typography variant="body2" gutterBottom>{parsed.Metadata?.Description}</Typography>
        {parsed.Tables.map((table: any, idx: number) => (
          <Card key={idx} variant="outlined" sx={{ my: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" color="primary"><b>Tabla:</b> {table.TableName}</Typography>
              <Typography variant="body2"><b>Descripción:</b> {table.TableDescription}</Typography>
              <Typography variant="body2"><b>Propósito:</b> {table.TablePurpose}</Typography>
              <Typography variant="body2"><b>Relaciones:</b> {table.TableRelationships}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Columnas:</b></Typography>
              <List dense>
                {table.Columns && table.Columns.map((col: any, cidx: number) => (
                  <ListItem key={cidx} sx={{ pl: 4 }}>
                    <ListItemText
                      primary={<><b>{col.ColumnName}</b> <span style={{color:'#888'}}>({col.DataType})</span></>}
                      secondary={col.Description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Historial de versiones generadas
          </Typography>
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          <List>
            {versions.map(v => (
              <ListItem key={v.id} divider>
                <ListItemText
                  primary={`Base: ${v.databaseName} (${v.databaseType})`}
                  secondary={`Fecha: ${new Date(v.generatedAt).toLocaleString()}${v.versionNumber ? ` | Versión: ${v.versionNumber}` : ''}${v.tag ? ` | Tag: ${v.tag}` : ''}`}
                />
                <Button variant="outlined" size="small" onClick={() => setSelectedVersion(v)}>
                  Ver contenido
                </Button>
              </ListItem>
            ))}
            {(!loading && versions.length === 0) && <Typography variant="body2">No hay versiones guardadas.</Typography>}
          </List>
        </CardContent>
      </Card>
      <Dialog open={!!selectedVersion} onClose={() => setSelectedVersion(null)} maxWidth="md" fullWidth>
        <DialogTitle>Contenido de la versión</DialogTitle>
        <DialogContent>
          {selectedVersion && (renderVersionContent((selectedVersion as any).content || selectedVersion))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVersion(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersionHistoryPage;
