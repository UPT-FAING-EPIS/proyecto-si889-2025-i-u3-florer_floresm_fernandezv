import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert, Checkbox, FormControlLabel
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface MySqlConnectionFormProps {
  onPreviewGenerated?: (data: any, databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver') => void;
}

const MySqlConnectionForm: React.FC<MySqlConnectionFormProps> = ({ onPreviewGenerated }) => {  
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: 'localhost',
    database: 'test',
    user: 'root',
    password: '',
    port: 3306, // Puerto por defecto de MySQL
    connectionString: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useConnectionString, setUseConnectionString] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnectionData(prev => ({ ...prev, [name]: value }));
  };
  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      let dataToSend = { ...connectionData };
      // Si se usa cadena personalizada, extraer el nombre de la base de datos
      if (useConnectionString && connectionData.connectionString) {
        const match = connectionData.connectionString.match(/Database=([^;]+)/i);
        if (match && match[1]) {
          dataToSend.database = match[1];
        }
      }
      const data = await apiService.generatePreviewMySql(dataToSend);
      onPreviewGenerated?.(data, 'mysql');
    } catch (err) {
      setError('Error al generar preview MySQL');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseConnectionString(e.target.checked);
    if (!e.target.checked) {
      setConnectionData(prev => ({ ...prev, connectionString: '' }));
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Conexión a MySQL
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Puerto"
                  name="port"
                  type="number"
                  value={connectionData.port}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
                  margin="normal"
                  sx={{ width: '30%' }}
                  placeholder="3306"
                  required={!useConnectionString}
                  disabled={useConnectionString}
                />
                <TextField
                  label="Base de datos"
                  name="database"
                  value={connectionData.database}
                  onChange={handleChange}
                  margin="normal"
                  required={!useConnectionString}
                  sx={{ width: '70%' }}
                  disabled={useConnectionString}
                />
              </Box>
              <TextField
                label="Usuario"
                name="user"
                value={connectionData.user}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required={!useConnectionString}
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
                required={!useConnectionString}
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
              placeholder="Ejemplo: Server=localhost;Database=test;User=root;Password=1234;"
              helperText="Ejemplo: Server=localhost;Database=test;User=root;Password=1234;. Si usas MySQL remoto, revisa el puerto y SSL si aplica."
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
              {loading ? <CircularProgress size={24} /> : 'Vista Previa y Edición (MySQL)'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default MySqlConnectionForm;
