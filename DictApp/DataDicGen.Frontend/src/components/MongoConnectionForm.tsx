import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress, Alert, Checkbox, FormControlLabel } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface MongoConnectionFormProps {
  onPreviewGenerated?: (data: any, dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver') => void;
}

const MongoConnectionForm: React.FC<MongoConnectionFormProps> = ({ onPreviewGenerated }) => {
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: '',
    database: '',
    user: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useConnectionString, setUseConnectionString] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnectionData(prev => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseConnectionString(e.target.checked);
    if (e.target.checked) {
      // Si se activa la cadena de conexión, limpiar los campos individuales y database
      setConnectionData({ connectionString: '', database: '', server: '', user: '', password: '', authSource: '' });
    } else {
      // Si se desactiva, limpiar la cadena de conexión
      setConnectionData(prev => ({ ...prev, connectionString: '' }));
    }
  };
  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (useConnectionString && connectionData.connectionString) {
        // Limpiar cadena
        const cleanConnectionString = connectionData.connectionString.trim().replace(/^"+|"+$/g, '');
        // Solo enviar la cadena de conexión, sin database
        const mongoPayload: any = { ConnectionString: cleanConnectionString };
        data = await apiService.generatePreviewMongo(mongoPayload);
      } else {
        data = await apiService.generatePreviewMongo(connectionData);
      }
      onPreviewGenerated?.(data, 'mongodb');
    } catch (err: any) {
      let backendMsg = '';
      if (err?.response?.data) {
        backendMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      }
      setError('Error al generar preview MongoDB' + (backendMsg ? ': ' + backendMsg : ''));
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Conexión a MongoDB
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={useConnectionString}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Usar cadena de conexión personalizada"
            sx={{ ml: 2, whiteSpace: 'nowrap' }}
          />
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <form>
          {!useConnectionString && (
            <>
              <TextField
                label="Servidor"
                name="server"
                value={connectionData.server}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required={!useConnectionString}
                placeholder="localhost"
                disabled={useConnectionString}
              />
              <TextField
                label="Base de datos"
                name="database"
                value={connectionData.database}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required={!useConnectionString}
                disabled={useConnectionString}
              />
              <TextField
                label="Usuario"
                name="user"
                value={connectionData.user}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={useConnectionString}
              />
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                value={connectionData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={useConnectionString}
              />
              <TextField
                label="Auth Source (opcional)"
                name="authSource"
                value={connectionData.authSource || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="admin"
                disabled={useConnectionString}
              />
            </>
          )}
          {useConnectionString && (
            <TextField
              label="Cadena de conexión personalizada"
              name="connectionString"
              value={connectionData.connectionString || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required={useConnectionString}
              placeholder="mongodb://usuario:contraseña@host:puerto/base?authSource=admin"
              helperText="Ejemplo: mongodb://user:pass@localhost:27017/mi_db?authSource=admin. Para MongoDB Atlas usa la cadena que te da el portal y agrega ?ssl=true si es necesario."
            />
          )}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="info"
              onClick={handleGeneratePreview}
              disabled={loading}
              fullWidth
              startIcon={<PreviewIcon />}
              sx={{ py: 1.5, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Vista Previa y Edición (MongoDB)'}
            </Button>
            {/* El botón de exportar Word se elimina, ahora solo se exporta desde la vista previa */}
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default MongoConnectionForm;
