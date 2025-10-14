// Função helper para acessar o storage correto
// Centraliza a lógica de storage em um único lugar

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  sessionStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  sessionStorage.removeItem('token');
};

export const getAuthUser = (): string | null => {
  return sessionStorage.getItem('user');
};

export const setAuthUser = (user: string): void => {
  sessionStorage.setItem('user', user);
};

export const removeAuthUser = (): void => {
  sessionStorage.removeItem('user');
};

export const clearAuth = (): void => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

