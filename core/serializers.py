from rest_framework import serializers
from .models import Doctor
from .models import Consulta
from django.contrib.auth.models import User
from .models import Perfil


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        #fields = '__all__'  # Incluye todos los campos del modelo Doctor
        fields = ['id', 'first_name', 'last_name', 'email', 'specialty', 'phone_number', 'profile_picture', 'address', 'biography', 'created_at', 'updated_at','horario_atencion', 'horario_atencion']

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = ['id','paciente', 'medico', 'fecha', 'hora', 'estado']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', '')
        )
        return user


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ['tipo_usuario']

class UserRegistrationSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer()

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'perfil')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Extraemos los datos del perfil
        perfil_data = validated_data.pop('perfil')
        
        # Creamos el usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', '')
        )
        
        # Creamos el perfil asociado
        Perfil.objects.create(user=user, tipo_usuario=perfil_data['tipo_usuario'])

        return user