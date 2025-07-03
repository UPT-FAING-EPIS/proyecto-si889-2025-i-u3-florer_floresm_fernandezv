import React from 'react';
import { 
  Container, Box, Paper, Typography, Button, Chip
} from '@mui/material';

interface MainMenuProps {
  onSelectOption: (option: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectOption }) => {  const menuOptions = [
    {
      id: 'sql',
      title: '',
      description: 'Base de datos relacional de Microsoft',
      image: '/sqlserver.svg',
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      type: 'Relacional'
    },
    {
      id: 'mysql',
      title: '',
      description: 'Base de datos relacional open source',
      image: '/mysql.svg',
      color: '#388e3c',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
      type: 'Relacional'
    },
    {
      id: 'postgres',
      title: '',
      description: 'Base de datos relacional avanzada',
      image: '/postgresql.svg',
      color: '#ff7043',
      gradient: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
      type: 'Relacional'
    },
    {
      id: 'mongo',
      title: '',
      description: 'Base de datos NoSQL orientada a documentos',
      image: '/mongodb.svg',
      color: '#26a69a',
      gradient: 'linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)',
      type: 'NoSQL'
    },
    {
      id: 'redis',
      title: '',
      description: 'Base de datos en memoria clave-valor',
      image: '/redis.svg',
      color: '#e53e3e',
      gradient: 'linear-gradient(135deg, #e53e3e 0%, #ff6b6b 100%)',
      type: 'NoSQL'
    },
    {
      id: 'cassandra',
      title: '',
      description: 'Base de datos NoSQL orientada a columnas',
      image: '/casandra.svg',
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
      type: 'NoSQL'
    }
  ];return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="lg" sx={{ py: 2, px: { xs: 2, sm: 4 } }}>        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="bold" 
            color="primary.main"
            sx={{ mb: 1 }}
          >
            DataDicGen
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ mb: 1 }}
          >
            Generador de Diccionario de Datos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selecciona el tipo de base de datos que deseas analizar
          </Typography>
        </Box>            <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))" 
          gap={3} 
          sx={{ mt: 2 }}
        >
          {menuOptions.map((option, index) => (
            <Paper 
              key={option.id}
              elevation={0} 
              className="hover-lift"
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                border: '1px solid rgba(0,0,0,0.1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }
              }}
              onClick={() => onSelectOption(option.id)}
            >
              {/* Header con gradiente */}              <Box 
                sx={{ 
                  background: option.gradient,
                  p: 3,
                  textAlign: 'center',
                  color: 'white'
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img 
                    src={option.image} 
                    alt={`${option.title} logo`}
                    style={{ 
                      width: '110px', 
                      height: '110px',
                      filter: 'brightness(0) invert(1)', // Hace las imágenes blancas
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
                <Typography variant="h5" component="h3" fontWeight="bold">
                  {option.title}
                </Typography>
                <Chip 
                  label={option.type}
                  size="small"
                  sx={{ 
                    mt: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '& .MuiChip-label': {
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Box>
              
              {/* Contenido */}
              <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}
                >
                  {option.description}
                </Typography>
                
                <Button 
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    background: option.gradient,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': {
                      background: option.color,
                      transform: 'scale(1.02)'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOption(option.id);
                  }}
                >
                  Conectar a {option.title}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MainMenu;