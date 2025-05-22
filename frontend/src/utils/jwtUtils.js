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
