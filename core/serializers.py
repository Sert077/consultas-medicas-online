from datetime import date
from rest_framework import serializers
from .models import Doctor
from .models import Consulta, Receta
from django.contrib.auth.models import User
from .models import Perfil
from rest_framework.validators import UniqueValidator
import secrets
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerificationToken
from .encryption_utils import encrypt_data, decrypt_data

class DoctorSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()
    biography = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    class Meta:
        model = Doctor
        fields = ['id', 'first_name', 'last_name', 'email', 'specialty', 'phone_number', 'profile_picture', 'address', 'biography', 'created_at', 'updated_at', 'days', 'start_time', 'end_time', 'user', 'consulta_duracion', 'modalidad_consulta']

    def get_phone_number(self, obj):
        return obj.get_phone_number()

    def get_biography(self, obj):
        return obj.get_biography()
    
    def get_address(self, obj):
        return obj.get_address()

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = ['id', 'paciente', 'medico', 'fecha', 'hora', 'estado', 'motivo_consulta', 'genero', 'tipo_sangre', 'alergias', 'edad', 'tipo_consulta', 'embarazo', 'archivo_pdf', 'enfermedad_base', 'medicacion', 'cirugia']

    def create(self, validated_data):
        paciente = validated_data.get('paciente')

        if paciente:
            perfil = getattr(paciente, 'perfil', None)
            if perfil and perfil.birthdate:
                today = date.today()
                validated_data['edad'] = today.year - perfil.birthdate.year - (
                    (today.month, today.day) < (perfil.birthdate.month, perfil.birthdate.day)
                )
            else:
                validated_data['edad'] = None  # O algún valor por defecto

        return Consulta.objects.create(**validated_data)
    
    
class PerfilSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False)  # Permitir escritura
    id_card = serializers.CharField(required=False)  # Permitir escritura

    class Meta:
        model = Perfil
        fields = ['tipo_usuario', 'birthdate', 'phone_number', 'id_card', 'user_picture', 'verificado']

    def update(self, instance, validated_data):
        # Si hay una nueva imagen de usuario, actualizamos el campo
        if 'user_picture' in validated_data:
            instance.user_picture = validated_data['user_picture']

        # Guardar otros datos normalmente sin volver a cifrar
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        """ Personalizar la salida para desencriptar phone_number e id_card """
        representation = super().to_representation(instance)
        representation['phone_number'] = instance.get_phone_number()  # Ya tiene la lógica de desencriptación
        representation['id_card'] = instance.get_id_card()  # Ya tiene la lógica de desencriptación
        return representation



class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer()  # Relación al Perfil 

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'is_superuser', 'perfil')  # Incluye is_superuser
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

        # Crear y guardar el token de verificación
        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(user=user, token=token)

        # Enviar correo de verificación
        verification_link = f"http://localhost:3000/verify-email/{token}"
        send_mail(
            'Verifica tu correo electrónico',
            f'Hola {user.first_name}, por favor verifica tu correo haciendo clic en el siguiente enlace: {verification_link}',
            'servesa07@gmail.com',
            [user.email],
            fail_silently=False,
        )

        # Si el tipo de usuario es 'medico', creamos el registro de Doctor
        if perfil_data['tipo_usuario'] == 'medico' and doctor_data:
            Doctor.objects.create(user=user, **doctor_data)
        
        return user
    

class RecetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receta
        fields = '__all__'