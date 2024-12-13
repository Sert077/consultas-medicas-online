import redis

try:
    r = redis.Redis(host='localhost', port=6379, db=0)
    r.ping()
    print("Conexión a Redis exitosa.")
except redis.ConnectionError:
    print("No se pudo conectar a Redis.")
