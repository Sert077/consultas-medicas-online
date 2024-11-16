from django.urls import path
from .views import DoctorCreateView, DoctorListView, DoctorDetailView, create_doctor, doctor_list, ConsultaCreateView, ConsultaListView, consultas_paciente, cancelar_consulta, consultas_medico
from .views import UserRegistrationView, login_user
from . import views
from .views import send_email
from .views import get_chat_messages, get_doctor_by_chat, consulta_detail, user_detail

urlpatterns = [
    # Rutas comentadas, puedes descomentarlas si las necesitas
    # path('', views.home, name='home'),
    # path('register-doctor/', views.register_doctor, name='register_doctor'),

    # API para crear un nuevo médico
    path('doctors/create/', create_doctor, name='create_doctor'),

    # Vista genérica para crear un médico (opcional)
    path('doctors/create/view/', DoctorCreateView.as_view(), name='doctor-create'),

    # Vista genérica para listar todos los médicos usando class-based view (opcional)
    path('doctores/', DoctorListView.as_view(), name='doctor-list-view'),

    # Vista genérica para obtener los detalles de un médico
    path('doctores/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),

    path('consultas/', ConsultaListView.as_view(), name='consulta-list'),
    path('consultas/create/', ConsultaCreateView.as_view(), name='consulta-create'),
    path('consultas/<int:doctor_id>/', views.consultas_doctor, name='consultas_doctor'),

    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', login_user, name='login'),

    path('send-email/', send_email, name='send_email'),
    path('consultas/paciente/<int:paciente_id>/', consultas_paciente, name='consultas_paciente'),
    path('consultas/<int:consulta_id>/cancelar/', cancelar_consulta, name='cancelar_consulta'),
    path('consultas/medico/<int:user_id>/', consultas_medico, name='consultas_medico'),
    path('chat/<str:chat_id>/messages/', get_chat_messages, name='get_chat_messages'),
    path('chat/<int:chat_id>/upload_image/', views.upload_image, name='upload_image'),
    path('chat/<int:chat_id>/doctor/', get_doctor_by_chat, name='get_doctor_by_chat'),

    path('chat/<int:chat_id>/consulta/', consulta_detail, name='consulta_detail'),
    path('users/<int:user_id>/', user_detail, name='user_detail'),

]
