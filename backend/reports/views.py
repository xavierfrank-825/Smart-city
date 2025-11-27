from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import WeatherReport
from .serializers import WeatherReportSerializer


class WeatherReportListCreate(generics.ListCreateAPIView):
    """
    GET /api/reports/?city=Delhi  -> list reports for a city
    POST /api/reports/           -> create a new report
    """

    serializer_class = WeatherReportSerializer

    def get_queryset(self):
        city = self.request.query_params.get("city")
        if city:
            return WeatherReport.objects.filter(city__iexact=city)
        return WeatherReport.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class WeatherReportRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/reports/{id}/     -> get a specific report
    PUT /api/reports/{id}/     -> update a report
    PATCH /api/reports/{id}/   -> partial update a report
    DELETE /api/reports/{id}/  -> delete a report
    """

    queryset = WeatherReport.objects.all()
    serializer_class = WeatherReportSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})
