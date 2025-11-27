from django.db import models


class WeatherReport(models.Model):
    CONDITION_CHOICES = [
        ('rain', 'Rain'),
        ('sunny', 'Sunny'),
        ('cloudy', 'Cloudy'),
        ('windy', 'Windy'),
        ('storm', 'Storm'),
        ('fog', 'Fog'),
        ('other', 'Other'),
    ]

    nickname = models.CharField(max_length=50, blank=True)
    message = models.CharField(max_length=255)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    city = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.city} - {self.condition} - {self.created_at}"
