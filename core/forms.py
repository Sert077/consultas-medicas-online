from django import forms
from .models import Doctor

class DoctorForm(forms.ModelForm):
    class Meta:
        model = Doctor
        fields = ['first_name', 'last_name', 'email', 'specialty', 'phone_number', 'address', 'profile_picture', 'biography']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'specialty': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Specialty'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Phone Number'}),
            'address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'address'}),
            'profile_picture': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'biography': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'biography'}),
        }
