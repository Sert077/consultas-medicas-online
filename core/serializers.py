from rest_framework import serializers
from .models import Doctor
from .models import Consulta
from django.contrib.auth.models import User
from .models import Perfil
from rest_framework.validators import UniqueValidator


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'first_name', 'last_name', 'email', 'specialty', 'phone_number', 'profile_picture', 'address', 'biography', 'created_at', 'updated_at', 'horario_atencion', 'user']

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = ['id', 'paciente', 'medico', 'fecha', 'hora', 'estado']  # Asegúrate de incluir 'paciente' en los campos

    def create(self, validated_data):
        return Consulta.objects.create(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'is_superuser')  # Incluye is_superuser
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
        fields = ['tipo_usuario', 'birthdate', 'phone_number', 'id_card', 'user_picture']

class UserRegistrationSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer()
    doctor = DoctorSerializer(required=False)  # Seguimos manteniendo opcional el doctor

    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Este nombre de usuario ya está en uso. Por favor, elige otro."
            )
        ]
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'perfil', 'doctor')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya se encuentra registrado.")
        return value

    def create(self, validated_data):
        # Extraemos los datos de perfil y doctor si existen
        perfil_data = validated_data.pop('perfil')
        doctor_data = validated_data.pop('doctor', None)

        # Creamos el usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', '')
        )

        # Creamos el perfil asociado al usuario
        Perfil.objects.create(
            user=user,
            tipo_usuario=perfil_data['tipo_usuario'],
            birthdate=perfil_data.get('birthdate'),
            phone_number=perfil_data.get('phone_number'),
            id_card=perfil_data.get('id_card'),
            user_picture=perfil_data.get('user_picture')
        )

        # Si el tipo de usuario es 'medico', creamos el registro de Doctor
        if perfil_data['tipo_usuario'] == 'medico' and doctor_data:
            Doctor.objects.create(user=user, **doctor_data)

        return user