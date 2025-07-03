import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert, Link, Avatar
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { apiService } from '../services/api-service';

interface LoginFormProps {
  onLoginSuccess: (username: string) => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  // Estado para los datos del formulario
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Estados para manejar la interacción con el usuario
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar el login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Intentar autenticar con el backend
      const isAuthenticated = await apiService.login(
        loginData.username, 
        loginData.password
      );
      
      if (isAuthenticated) {
        onLoginSuccess(loginData.username);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error durante el inicio de sesión');
      }
    } finally {
      setLoading(false);
    }
  };  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        margin: 0,
        padding: 0
      }}
    >      <Card 
        variant="outlined" 
        className="fade-in"
        sx={{ 
          width: '100%',
          maxWidth: 420, 
          mx: { xs: 2, sm: 0 }, // Solo margen en móviles
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>            <Avatar sx={{ 
              m: 0.5, 
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              mb: 1.5
            }}>
              <LockIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
              DataDicGen
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              Generador de Diccionario de Datos
            </Typography>
          </Box>
          {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem'
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            name="username"
            value={loginData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            variant="outlined"            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={loginData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            variant="outlined"            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 15px rgba(33, 203, 243, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                boxShadow: '0 5px 20px rgba(33, 203, 243, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Iniciando sesión...</span>
              </Box>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>          
          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes una cuenta?
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
              }}
              sx={{ 
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Registrarse aquí
            </Link>
          </Box>
        </form>
      </CardContent>
    </Card>
    </Box>
  );
};

export default LoginForm;