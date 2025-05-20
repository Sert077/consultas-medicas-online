import base64
import binascii
import hashlib
import os
from dotenv import load_dotenv
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

# Cargar variables del .env
load_dotenv()

# Obtener la clave desde .env
SECRET_KEY = os.getenv('AES_SECRET_KEY')

if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise ValueError("AES_SECRET_KEY en .env debe tener al menos 32 caracteres")

# Convertir clave a 32 bytes usando SHA256
def get_key():
    return hashlib.sha256(SECRET_KEY.encode()).digest()

# Cifrar datos
def encrypt_data(plain_text):
    key = get_key()
    cipher = AES.new(key, AES.MODE_CBC)
    iv = cipher.iv  # Vector de inicialización
    encrypted_bytes = cipher.encrypt(pad(plain_text.encode(), AES.block_size))
    return base64.b64encode(iv + encrypted_bytes).decode('utf-8')

# Desencriptar datos
def decrypt_data(encrypted_text):
    if not encrypted_text:  # Si es None o vacío, devolver None
        return None
    
    key = get_key()
    
    try:
        # Intentar decodificar desde Base64
        encrypted_bytes = base64.b64decode(encrypted_text)
        
        # Verificar que la longitud sea suficiente para contener IV + datos cifrados
        if len(encrypted_bytes) < AES.block_size:
            return encrypted_text  # No está cifrado, devolver el texto original
        
        # Obtener IV y descifrar
        iv = encrypted_bytes[:AES.block_size]
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_bytes = unpad(cipher.decrypt(encrypted_bytes[AES.block_size:]), AES.block_size)
        
        return decrypted_bytes.decode('utf-8')

    except (binascii.Error, ValueError):
        # Si falla la desencriptación, devolver el texto original
        return encrypted_text

