import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress, Alert, Checkbox, FormControlLabel } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface PostgresConnectionFormProps {
  onPreviewGenerated?: (data: any, dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver') => void;
}

const PostgresConnectionForm: React.FC<PostgresConnectionFormProps> = ({ onPreviewGenerated }) => {
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
    if (!e.target.checked) {
      setConnectionData(prev => ({ ...prev, connectionString: '' }));
    }
  };
  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      let dataToSend = { ...connectionData };
      // Si se usa cadena personalizada, extraer el nombre de la base de datos
      if (useConnectionString && connectionData.connectionString) {
        // Busca Database=mi_db o database=mi_db en la cadena
        const match = connectionData.connectionString.match(/Database=([^;]+)/i);
        if (match && match[1]) {
          dataToSend.database = match[1];
        }
      }
      const data = await apiService.generatePreviewPostgres(dataToSend);
      onPreviewGenerated?.(data, 'postgresql'); // <-- Pasamos el tipo de BD
    } catch (err) {
      setError('Error al generar preview PostgreSQL');
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
            Conexión a PostgreSQL
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
              placeholder="Host=localhost;Port=5432;Database=mi_db;Username=postgres;Password=1234;"
              helperText="Ejemplo: Host=localhost;Port=5432;Database=mi_db;Username=postgres;Password=1234;. Si usas SSL agrega ?sslmode=require al final."
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
              {loading ? <CircularProgress size={24} /> : 'Vista Previa y Edición (PostgreSQL)'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostgresConnectionForm;
