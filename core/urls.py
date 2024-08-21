from django.urls import path
from . import views
from .views import DoctorCreateView, DoctorListView, DoctorDetailView

urlpatterns = [
    #path('', views.home, name='home'),
    #path('register-doctor/', views.register_doctor, name='register_doctor'),
    path('doctors/create/', views.create_doctor, name='create_doctor'),
    path('doctors/create/', DoctorCreateView.as_view(), name='doctor-create'),
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
]
