import axios from 'axios';
import { DatabaseConnectionDto, ConnectionResponseDto } from '../types/api-types';

// URL base de la API backend (desplegada en AWS Elastic Beanstalk v2)
//const API_URL = 'http://dictapp-backend-v2-env.eba-mxmstnzx.us-east-2.elasticbeanstalk.com/api';
//const API_URL = 'https://lgdnqienk6.execute-api.us-east-2.amazonaws.com/api';
 //const API_URL = 'http://localhost:5175/api';
 const API_URL = '/api';
// Crear una instancia de axios con configuración personalizada
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Servicios para conectarse y obtener datos
export const apiService = {
  // Autenticar usuario
  async login(username: string, password: string): Promise<boolean> {
    try {
      console.log('Intentando login con:', { username, apiUrl: API_URL });
      
      const response = await apiClient.post('/Auth/login', {
        username,
        password
      });
      
      console.log('Respuesta del login:', response.status, response.data);
      return response.status === 200;
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        // La request se hizo pero no se recibió respuesta
        console.error('Error request:', error.request);
      } else {
        // Algo pasó al configurar la request
        console.error('Error config:', error.message);
      }
        return false;
    }
  },

  // Registrar nuevo usuario
  async register(username: string, password: string): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      console.log('Intentando registro con:', { username, apiUrl: API_URL });
      
      const response = await apiClient.post('/Auth/register', {
        username,
        password
      });
      
      console.log('Respuesta del registro:', response.status, response.data);
      
      if (response.status === 201) {
        return {
          success: true,
          message: response.data.message || 'Usuario registrado exitosamente',
          userId: response.data.userId
        };
      }
      
      return {
        success: false,
        message: 'Error inesperado en el registro'
      };
    } catch (error: any) {
      console.error('Error de registro:', error);
      
      let errorMessage = 'Error de registro';
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error response:', error.response.status, error.response.data);
        errorMessage = error.response.data?.message || `Error ${error.response.status}`;
      } else if (error.request) {
        // La request se hizo pero no se recibió respuesta
        console.error('Error request:', error.request);
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        // Algo pasó al configurar la request
        console.error('Error config:', error.message);
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Conectar a la base de datos y obtener un token
  async connectToDatabase(credentials: DatabaseConnectionDto): Promise<ConnectionResponseDto> {
    const response = await apiClient.post<ConnectionResponseDto>('/Metadata/connect', credentials);
    return response.data;
  },

  // Descargar el diccionario en formato PDF usando un token
  async downloadPdfDictionary(token: string): Promise<Blob> {
    const response = await apiClient.get(`/Metadata/diccionario/pdf/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar el diccionario en formato Word usando un token
  async downloadWordDictionary(token: string): Promise<Blob> {
    const response = await apiClient.get(`/Word/diccionario/word/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar el diccionario en PDF usando credenciales directamente
  async downloadPdfWithCredentials(credentials: DatabaseConnectionDto): Promise<Blob> {
    const response = await apiClient.post('/Metadata/diccionario/pdf', credentials, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Descargar el diccionario en Word usando credenciales directamente
  async downloadWordWithCredentials(credentials: DatabaseConnectionDto): Promise<Blob> {
    const response = await apiClient.post('/Word/diccionario/word', credentials, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Visualizar el PDF en el navegador
  async viewPdfDictionary(credentials: DatabaseConnectionDto): Promise<Blob> {
    const response = await apiClient.post('/PdfView/ver-diccionario', credentials, {
      responseType: 'blob'
    });
    return response.data;
  },


  // ⬅️ NUEVOS MÉTODOS PARA PREVIEW
  // Generar vista previa editable del diccionario
  async generatePreview(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/generate-preview', credentials);
    return response.data;
  },

  // Exportar PDF con datos editados del preview y obtener el token
  async exportPdfFromPreview(previewData: any): Promise<{ token: string }> {
    const response = await apiClient.post('/Metadata/export-pdf', previewData);
    return response.data; // { token: '...' }
  },
  // Generar vista previa editable del diccionario para MySQL
  async generatePreviewMySql(credentials: DatabaseConnectionDto): Promise<any> {
    try {
      console.log('Enviando datos MySQL:', credentials);
      const response = await apiClient.post('/Metadata/mysql/generate-preview', credentials);
      console.log('Respuesta MySQL exitosa:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error MySQL completo:', error);
      
      if (error.response) {
        console.error('Error MySQL response:', error.response.status, error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error MySQL request:', error.request);
      } else {
        console.error('Error MySQL config:', error.message);
      }
      
      throw error;
    }
  },

  // Generar vista previa editable del diccionario para PostgreSQL
  async generatePreviewPostgres(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/postgres/generate-preview', credentials);
    return response.data;
  },

  // Generar vista previa editable del diccionario para MongoDB
  async generatePreviewMongo(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/mongo/generate-preview', credentials);
    return response.data;
  },

  // Generar vista previa editable del diccionario para Redis
  async generatePreviewRedis(credentials: DatabaseConnectionDto): Promise<any> {
    try {
      console.log('Enviando datos Redis:', credentials);
      const response = await apiClient.post('/Metadata/redis/generate-preview', credentials);
      console.log('Respuesta Redis exitosa:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error Redis completo:', error);
      
      if (error.response) {
        console.error('Error Redis response:', error.response.status, error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error Redis request:', error.request);
      } else {
        console.error('Error Redis config:', error.message);
      }
      
      throw error;
    }
  },

  // Generar vista previa editable del diccionario para Cassandra
  async generatePreviewCassandra(credentials: DatabaseConnectionDto): Promise<any> {
    try {
      console.log('Enviando datos Cassandra:', credentials);
      const response = await apiClient.post('/Metadata/cassandra/generate-preview', credentials);
      console.log('Respuesta Cassandra exitosa:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error Cassandra completo:', error);
      
      if (error.response) {
        console.error('Error Cassandra response:', error.response.status, error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error Cassandra request:', error.request);
      } else {
        console.error('Error Cassandra config:', error.message);
      }
      
      throw error;
    }
  },

  // Descargar el PDF temporal generado por export-pdf usando el token
  async downloadExportedPdf(token: string): Promise<Blob> {
    const response = await apiClient.get(`/Metadata/download-exported-pdf/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar y convertir el PDF exportado a Word usando el token
  async convertPdfToWordByToken(token: string): Promise<Blob> {
    const response = await apiClient.get(`/Metadata/convert-pdf-to-word/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar Word directamente desde el preview (nuevo flujo)
  async exportWord(previewData: any): Promise<Blob> {
    // Asumimos que el endpoint es /Metadata/export-word y recibe el preview como JSON
    const response = await apiClient.post('/Metadata/export-word', previewData, {
      responseType: 'blob'
    });
    return response.data;
  },
};
