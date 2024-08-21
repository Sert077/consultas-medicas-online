from django.shortcuts import render, redirect
from rest_framework import generics
from .models import Doctor
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import DoctorSerializer

from .forms import DoctorForm
# Create your views here.

@api_view(['POST'])
def create_doctor(request):
    if request.method == 'POST':
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

def register_doctor(request):
    if request.method == 'POST':
        form = DoctorForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('success_page')  # Redirigir a una página de éxito después del registro
    else:
        form = DoctorForm()

    return render(request, 'register_doctor.html', {'form': form})

def home(request):
    return render(request, 'home.html')

# Vista para crear un nuevo médico
class DoctorCreateView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

# Vista para listar todos los médicos
class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

# Vista para ver detalles de un médico
class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer