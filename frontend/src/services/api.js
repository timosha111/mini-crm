import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// К каждому запросу добавляем JWT из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Если сервер сказал 401 (токен истёк/неверный) — выходим на страницу входа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const DEFAULT_MESSAGES = {
  400: 'Проверьте введённые данные',
  401: 'Необходимо войти в систему',
  403: 'Недостаточно прав',
  404: 'Объект не найден',
  409: 'Такая запись уже существует',
  500: 'Ошибка сервера',
};

// Превращает ошибку axios в понятный текст для пользователя
export function getErrorMessage(error) {
  if (!error.response) return 'Нет связи с сервером. Проверьте, что backend запущен.';
  const { status, data } = error.response;
  const details = Array.isArray(data?.details) ? `: ${data.details.join('; ')}` : '';
  return (data?.message || DEFAULT_MESSAGES[status] || DEFAULT_MESSAGES[500]) + details;
}

export default api;
