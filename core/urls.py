from django.urls import path
from .views import DoctorCreateView, DoctorListView, DoctorDetailView, create_doctor, doctor_list

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
]
