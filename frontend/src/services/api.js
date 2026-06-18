import axios from 'axios';
let accessToken = null;

// Función para actualizar el token desde nuestros componentes o contexto
export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  withCredentials: true, 
});


// interceptor de peticiones - El Portero del Token
api.interceptors.request.use(
  (config) => {
    // Si tenemos un token en memoria, se lo inyectamos en el header de Autorización
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// interceptor de respuestas - El Guardián del Token
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
  
        const { data } = await axios.post(
          'http://localhost:3000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

   
        setAccessToken(data.accessToken);


        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        

        return api(originalRequest);
      } catch (refreshError) {

        setAccessToken(null);
     
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;