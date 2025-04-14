from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Doctor  # Ajusta según tu estructura
from .models import Consulta
from datetime import date

class ConsultaCreateAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Crear usuario paciente
        self.paciente = User.objects.create_user(username='paciente1', password='12345')

        # Crear doctor
        self.doctor = Doctor.objects.create(
            first_name='Juan',
            last_name='Pérez',
            email='juanperez@example.com',
            specialty='Cardiología',
            phone_number='123456789',
            address='Calle Falsa 123',
            biography='Experto en cardiología con 10 años de experiencia.',
            user=self.paciente
        )

    def test_crear_consulta_exitosa(self):
        payload = {
            "paciente": self.paciente.id,
            "medico": self.doctor.id,
            "fecha": date.today().isoformat(),
            "hora": "10:00",
            "estado": "pendiente",
            "motivo_consulta": "Dolor en el pecho",
            "genero": "M",
            "tipo_sangre": "O+",
            "alergias": "Ninguna",
            "tipo_consulta": "presencial",
            "embarazo": False,
            "enfermedad_base": "Ninguna",
            "medicacion": "Ninguna",
            "cirugia": "Ninguna"
        }

        response = self.client.post("/api/consultas/create/", payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Consulta.objects.count(), 1)

        # Usar el método 'get_motivo_consulta' para obtener el valor descifrado
        consulta = Consulta.objects.first()
        self.assertEqual(consulta.get_motivo_consulta(), "Dolor en el pecho")
