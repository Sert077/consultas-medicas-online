from locust import HttpUser, task, between
import random
import json
import os
from io import BytesIO
from PIL import Image

class RegisterUser(HttpUser):
    wait_time = between(1, 2)

    counter = 0
    total_users = 1000
    users_file = "usuarios.json"
    users_data = []

    @task
    def register(self):
        if RegisterUser.counter >= RegisterUser.total_users:
            if not os.path.exists(RegisterUser.users_file):
                with open(RegisterUser.users_file, "w") as f:
                    json.dump(RegisterUser.users_data, f, indent=4)

            self.environment.runner.quit()
            return

        user_id = RegisterUser.counter
        RegisterUser.counter += 1

        username = f"user{user_id}"
        email = f"{username}@example.com"
        password = "TestPassword123"
        first_name = f"User{user_id}"
        last_name = "Test"
        birthdate = "1990-01-01"
        phone_number = f"999999{random.randint(1000, 9999)}"
        id_card = f"DNI{random.randint(100000, 999999)}"

        # 🔧 Simular imagen dummy (selfie)
        image = Image.new("RGB", (100, 100), color=(
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(0, 255)
        ))
        img_bytes = BytesIO()
        image.save(img_bytes, format="JPEG")
        img_bytes.seek(0)
        img_bytes.name = "selfie.jpg"  # Requerido para que Django lo reconozca bien

        # 📤 Enviar como multipart/form-data
        form_data = {
            "username": (None, username),
            "password": (None, password),
            "first_name": (None, first_name),
            "last_name": (None, last_name),
            "email": (None, email),
            "perfil.tipo_usuario": (None, "paciente"),
            "perfil.birthdate": (None, birthdate),
            "perfil.phone_number": (None, phone_number),
            "perfil.id_card": (None, id_card),
            "perfil.user_picture": ("selfie.jpg", img_bytes, "image/jpeg"),
        }

        response = self.client.post("/api/register/", files=form_data)

        if response.status_code == 201:
            RegisterUser.users_data.append({
                "username": username,
                "email": email,
                "password": password
            })
        else:
            print(f"❌ Falló usuario {username}: {response.status_code} - {response.text}")
