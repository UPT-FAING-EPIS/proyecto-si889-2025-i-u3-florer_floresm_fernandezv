import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert, Link, Avatar
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { apiService } from '../services/api-service';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  // Estado para los datos del formulario
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Estados para manejar la interacción con el usuario
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Validar el formulario
  const validateForm = (): string | null => {
    if (registerData.username.length < 3) {
      return 'El usuario debe tener al menos 3 caracteres';
    }
    
    if (registerData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  };

  // Manejar el registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Intentar registrar en el backend
      const result = await apiService.register(
        registerData.username, 
        registerData.password
      );
      
      if (result.success) {
        setSuccess(result.message);
        // Limpiar formulario
        setRegisterData({
          username: '',
          password: '',
          confirmPassword: ''
        });
        
        // Llamar callback de éxito después de un breve delay
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error durante el registro');
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
          maxWidth: 450, 
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
              bgcolor: 'secondary.main',
              width: 48,
              height: 48,
              mb: 1.5
            }}>
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
              Crear Cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              Únete a DataDicGen
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
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem'
              }
            }}
          >
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleRegister}>
          <TextField
            label="Usuario"
            name="username"
            value={registerData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            variant="outlined"            helperText="Mínimo 3 caracteres"
            sx={{
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
            value={registerData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            variant="outlined"            helperText="Mínimo 6 caracteres"
            sx={{
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
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            value={registerData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            variant="outlined"            helperText="Debe coincidir con la contraseña"
            sx={{
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
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)',
              boxShadow: '0 3px 15px rgba(255, 107, 107, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252 30%, #FF7979 90%)',
                boxShadow: '0 5px 20px rgba(255, 107, 107, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Registrando...</span>
              </Box>
            ) : (
              'Crear Cuenta'
            )}
          </Button>          
          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes una cuenta?
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
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
              Iniciar Sesión
            </Link>
          </Box>
        </form>
      </CardContent>
    </Card>
    </Box>
  );
};

export default RegisterForm;
