# Generated by Django 4.1.1 on 2024-09-07 19:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_alter_perfil_tipo_usuario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='perfil',
            name='tipo_usuario',
            field=models.CharField(choices=[('paciente', 'Paciente'), ('medico', 'Médico')], max_length=10),
        ),
    ]
