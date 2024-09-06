from rest_framework import serializers
from .models import Doctor
from .models import Consulta
class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        #fields = '__all__'  # Incluye todos los campos del modelo Doctor
        fields = ['id', 'first_name', 'last_name', 'email', 'specialty', 'phone_number', 'profile_picture', 'address', 'biography', 'created_at', 'updated_at']

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = ['id','paciente', 'medico', 'fecha', 'hora', 'estado']