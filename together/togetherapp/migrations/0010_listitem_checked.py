# Generated by Django 3.1.1 on 2020-10-01 00:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('togetherapp', '0009_auto_20200930_0335'),
    ]

    operations = [
        migrations.AddField(
            model_name='listitem',
            name='checked',
            field=models.BooleanField(default=False),
        ),
    ]