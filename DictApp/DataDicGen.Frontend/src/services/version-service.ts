import axios from 'axios';

//const API_URL = 'http://dictapp-backend-v2-env.eba-mxmstnzx.us-east-2.elasticbeanstalk.com/api';
//const API_URL = 'https://lgdnqienk6.execute-api.us-east-2.amazonaws.com/api';
const API_URL = '/api';
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const versionService = {
  // Guardar una nueva versión
  async saveVersion(preview: any, userId: string, databaseType: string) {
    const response = await apiClient.post(`/Metadata/save-version?userId=${userId}&databaseType=${databaseType}`, preview);
    return response.data;
  },

  // Listar historial de versiones de un usuario
  async getVersions(userId: string) {
    const response = await apiClient.get(`/Metadata/versions?userId=${userId}`);
    return response.data;
  },
};
