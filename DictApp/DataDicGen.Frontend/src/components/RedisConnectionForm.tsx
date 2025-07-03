import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress, Alert, FormControlLabel, Checkbox } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface RedisConnectionFormProps {
  onPreviewGenerated?: (data: any, dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver' | 'redis' | 'cassandra') => void;
}

const RedisConnectionForm: React.FC<RedisConnectionFormProps> = ({ onPreviewGenerated }) => {
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: 'localhost',
    database: '', // No se usa en Redis, pero mantenemos por compatibilidad
    user: '',
    password: '',
    port: 6379,
    redisDatabase: 0,
    useSsl: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setConnectionData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'port' || name === 'redisDatabase') {
      setConnectionData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setConnectionData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.generatePreviewRedis(connectionData);
      onPreviewGenerated?.(data, 'redis'); // <-- Pasamos el tipo de BD
    } catch (err) {
      setError('Error al generar preview Redis');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          🔴 Conexión a Redis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Base de datos en memoria clave-valor
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
          placeholder="localhost o 127.0.0.1"
          helperText="Dirección del servidor Redis"
        />
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField
            label="Puerto"
            name="port"
            type="number"
            value={connectionData.port || ''}
            onChange={handleChange}
            margin="normal"
            placeholder="6379"
            helperText="Puerto por defecto: 6379"
          />
          <TextField
            label="Base de Datos"
            name="redisDatabase"
            type="number"
            value={connectionData.redisDatabase ?? 0}
            onChange={handleChange}
            margin="normal"
            placeholder="0"
            helperText="Número de BD (0-15)"
          />
        </Box>
        <TextField
          label="Usuario (opcional)"
          name="user"
          value={connectionData.user}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="redis"
          helperText="Usuario para autenticación ACL"
        />
        <TextField
          label="Contraseña (opcional)"
          name="password"
          type="password"
          value={connectionData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="contraseña del servidor"
          helperText="Contraseña AUTH de Redis"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="useSsl"
              checked={connectionData.useSsl || false}
              onChange={handleChange}
            />
          }
          label="Usar SSL/TLS"
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleGeneratePreview}
            disabled={loading || !connectionData.server}
            fullWidth
            startIcon={<PreviewIcon />}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Vista Previa y Métricas (Redis)'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          💡 Redis analiza tipos de datos (string, hash, list, set, zset, stream) y estadísticas del servidor
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RedisConnectionForm;
