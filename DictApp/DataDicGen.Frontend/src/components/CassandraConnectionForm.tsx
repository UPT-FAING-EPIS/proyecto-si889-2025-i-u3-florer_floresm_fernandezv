import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface CassandraConnectionFormProps {
  onPreviewGenerated?: (data: any, dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver' | 'redis' | 'cassandra') => void;
}

const CassandraConnectionForm: React.FC<CassandraConnectionFormProps> = ({ onPreviewGenerated }) => {
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: 'localhost',
    database: '', // No se usa en Cassandra, pero mantenemos por compatibilidad
    user: '',
    password: '',
    port: 9042,
    keyspace: '',
    dataCenter: 'datacenter1'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'port') {
      setConnectionData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setConnectionData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.generatePreviewCassandra(connectionData);
      onPreviewGenerated?.(data, 'cassandra'); // <-- Pasamos el tipo de BD
    } catch (err) {
      setError('Error al generar preview Cassandra');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          🔷 Conexión a Cassandra
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Base de datos NoSQL orientada a columnas distribuida
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <TextField
          label="Servidor"
          name="server"
          value={connectionData.server}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          placeholder="localhost o IP del nodo"
          helperText="Dirección de cualquier nodo del cluster"
        />
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField
            label="Puerto"
            name="port"
            type="number"
            value={connectionData.port || ''}
            onChange={handleChange}
            margin="normal"
            placeholder="9042"
            helperText="Puerto por defecto: 9042"
          />
          <TextField
            label="Data Center"
            name="dataCenter"
            value={connectionData.dataCenter || ''}
            onChange={handleChange}
            margin="normal"
            placeholder="datacenter1"
            helperText="Nombre del data center"
          />
        </Box>
        <TextField
          label="Keyspace (opcional)"
          name="keyspace"
          value={connectionData.keyspace || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="mi_keyspace"
          helperText="Dejar vacío para explorar todos los keyspaces"
        />
        <TextField
          label="Usuario (opcional)"
          name="user"
          value={connectionData.user}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="cassandra"
          helperText="Usuario para autenticación"
        />
        <TextField
          label="Contraseña (opcional)"
          name="password"
          type="password"
          value={connectionData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="contraseña del usuario"
          helperText="Contraseña de autenticación"
        />
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGeneratePreview}
            disabled={loading || !connectionData.server}
            fullWidth
            startIcon={<PreviewIcon />}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Vista Previa y Métricas (Cassandra)'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          💡 Cassandra analiza keyspaces, column families, claves de partición y clustering
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CassandraConnectionForm;
