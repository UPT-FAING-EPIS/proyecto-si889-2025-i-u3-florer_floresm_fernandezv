import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert, Divider, Checkbox, FormControlLabel
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

// ⬅️ Agregar prop para manejar el preview
interface SqlConnectionFormProps {
  onPreviewGenerated?: (data: any, dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver') => void;
  
}

const SqlConnectionForm: React.FC<SqlConnectionFormProps> = ({ onPreviewGenerated }) => {
  // Estado para los datos del formulario
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: '',
    database: '',
    user: '',
    password: ''
  });

  // Estados para manejar la interacción con el usuario
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [connectionToken, setConnectionToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [useConnectionString, setUseConnectionString] = useState<boolean>(false);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnectionData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Resetear el estado de conexión si cambian los datos
    if (isConnected) {
      setIsConnected(false);
      setSuccessMessage(null);
    }
  };
  // ⬅️ Nueva función para generar preview
  const handleGeneratePreview = async () => {    try {
      setLoading(true);
      setError(null);
      
      // Usar api-service en lugar de fetch directo
      const data = await apiService.generatePreview(connectionData);
      onPreviewGenerated?.(data, 'sqlserver'); // <-- Pasamos el tipo de BD
      
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error al generar preview: ${err.message}`);
      } else {
        setError('Error al generar preview');
      }
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Conectar a la base de datos
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setIsConnected(false);

    try {
      const response = await apiService.connectToDatabase(connectionData);
      setConnectionToken(response.token);
      setSuccessMessage(response.message);
      setIsConnected(true);
      
      // Guardar token y datos de conexión en localStorage para uso posterior
      if (response.token) {
        localStorage.setItem('connectionToken', response.token);
      }
      localStorage.setItem('connectionData', JSON.stringify(connectionData));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al conectar con la base de datos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Descargar el diccionario en PDF
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      
      let pdfBlob;
      if (connectionToken) {
        // Usar el token si existe
        pdfBlob = await apiService.downloadPdfDictionary(connectionToken);
      } else {
        // Usar las credenciales directamente
        pdfBlob = await apiService.downloadPdfWithCredentials(connectionData);
      }
      
      // Crear una URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'diccionario_datos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccessMessage('Diccionario en PDF descargado exitosamente');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al descargar el PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  // Descargar el diccionario en Word
  const handleDownloadWord = async () => {
    try {
      setLoading(true);
      
      let wordBlob;
      if (connectionToken) {
        // Usar el token si existe
        wordBlob = await apiService.downloadWordDictionary(connectionToken);
      } else {
        // Usar las credenciales directamente
        wordBlob = await apiService.downloadWordWithCredentials(connectionData);
      }
      
      // Crear una URL para el blob y descargar
      const url = window.URL.createObjectURL(wordBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'diccionario_datos.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccessMessage('Diccionario en Word descargado exitosamente');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al descargar el Word');
      }
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
            Conexión a SQL Server
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <form onSubmit={handleConnect}>
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
              placeholder="Ejemplo: Server=...;Database=...;User Id=...;Password=...;"
              helperText="Si se llena, se usará esta cadena y se ignorarán los campos individuales."
            />
          )}
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Conectar'}
            </Button>
          </Box>
        </form>
        
         {isConnected && (
          <>
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h6" component="h3" gutterBottom>
              Generar Diccionario de Datos
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Conexión establecida. Elija una opción para generar el diccionario.
            </Typography>
            
            {/* ⬅️ Nuevo botón de Preview */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="info"
                onClick={handleGeneratePreview}
                disabled={loading}
                fullWidth
                startIcon={<PreviewIcon />}
                sx={{ py: 1.5, mb: 2 }}
              >
                Vista Previa y Edición
              </Button>
              
              <Typography variant="body2" color="text.secondary" align="center">
                Recomendado: Genere una vista previa para revisar y editar antes de exportar
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph align="center">
              O descargue directamente:
            </Typography>
              <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
              gap={3} 
              sx={{ mt: 1 }}
            >
              <Button
                variant="outlined" // ⬅️ Cambiar a outlined para dar menos prioridad
                color="primary"
                onClick={handleDownloadPdf}
                disabled={loading}
                fullWidth
                startIcon={<PictureAsPdfIcon />}
                sx={{ py: 1.5 }}
              >
                Generar PDF Directo
              </Button>
              <Button
                variant="outlined" // ⬅️ Cambiar a outlined
                color="secondary"
                onClick={handleDownloadWord}
                disabled={loading}
                fullWidth
                startIcon={<DescriptionIcon />}
                sx={{ py: 1.5 }}              >
                Generar Word Directo
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SqlConnectionForm;