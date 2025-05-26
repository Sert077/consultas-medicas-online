import { jwtDecode } from 'jwt-decode';

export const isSuperUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.is_superuser === true;
  } catch (error) {
    console.error('Token inválido', error);
    return false;
  }
};


export function isTokenValid(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64); // Decodifica base64
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}
