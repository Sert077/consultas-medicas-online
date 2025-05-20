from locust import HttpUser, task, between, events
import json
import random
import threading
import sys

# Cargar los usuarios desde el JSON
with open("usuarios.json", encoding="utf-8") as f:
    usuarios = json.load(f)

# Variables globales
login_counter = 0
max_logins = 1000
lock = threading.Lock()

class UserLoginTest(HttpUser):
    wait_time = between(1, 2)  # Tiempo de espera entre tareas

    @task
    def login(self):
        global login_counter

        # Detener ejecución al alcanzar el límite
        with lock:
            if login_counter >= max_logins:
                self.environment.runner.quit()
                return

        # Escoger usuario aleatorio
        usuario = random.choice(usuarios)
        payload = {
            "username": usuario["username"],
            "password": usuario["password"]
        }

        # Intentar login
        with self.client.post("/api/login/", json=payload, catch_response=True) as response:
            if response.status_code == 200:
                with lock:
                    login_counter += 1
                    print(f"✔ Login #{login_counter} exitoso para {usuario['username']}")
                    if login_counter >= max_logins:
                        self.environment.runner.quit()
                response.success()
            else:
                response.failure(f"❌ Fallo login para {usuario['username']}: {response.status_code} - {response.text}")
