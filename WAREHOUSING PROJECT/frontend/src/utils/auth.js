export const getToken = () => localStorage.getItem('token');

export const getRole = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (e) {
    return localStorage.getItem('role'); // Fallback to stored role
  }
};

export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      user_id: payload.user_id,
      role: payload.role
    };
  } catch (e) {
    return null;
  }
};

export const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

export const isLoggedIn = () => !!getToken();
