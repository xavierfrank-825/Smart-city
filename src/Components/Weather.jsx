import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Zap,
  Navigation,
  Thermometer,
  Activity,
  AlertCircle,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import CrowdReports from './CrowdReports';

const SmartCityDashboard = () => {
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const indianCities = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lon: 80.9462 }
  ];

  const fetchCityData = async (cityName) => {
    setLoading(true);
    setError(null);
    
    const city = indianCities.find(c => c.name === cityName);
    
    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,pressure_msl,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,uv_index&timezone=Asia/Kolkata&forecast_days=1`
      );
      const weatherJson = await weatherResponse.json();
      
      const aqiResponse = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,dust&hourly=pm2_5&timezone=Asia/Kolkata`
      );
      const aqiJson = await aqiResponse.json();
      
      setWeatherData(weatherJson);
      setAirQuality(aqiJson);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCityData(selectedCity);
    const interval = setInterval(() => {
      fetchCityData(selectedCity);
    }, 300000);

    return () => clearInterval(interval);
  }, [selectedCity]);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun style={{ width: '48px', height: '48px', color: '#facc15' }} />;
    if (code <= 3) return <Cloud style={{ width: '48px', height: '48px', color: '#9ca3af' }} />;
    if (code <= 67) return <CloudRain style={{ width: '48px', height: '48px', color: '#60a5fa' }} />;
    if (code <= 77) return <CloudSnow style={{ width: '48px', height: '48px', color: '#bfdbfe' }} />;
    if (code <= 82) return <CloudRain style={{ width: '48px', height: '48px', color: '#3b82f6' }} />;
    return <Zap style={{ width: '48px', height: '48px', color: '#eab308' }} />;
  };

  const getAQILevel = (pm25) => {
    if (pm25 <= 12) return { level: 'Good', color: '#22c55e', textColor: '#16a34a' };
    if (pm25 <= 35.4) return { level: 'Moderate', color: '#eab308', textColor: '#ca8a04' };
    if (pm25 <= 55.4) return { level: 'Unhealthy for Sensitive', color: '#f97316', textColor: '#ea580c' };
    if (pm25 <= 150.4) return { level: 'Unhealthy', color: '#ef4444', textColor: '#dc2626' };
    if (pm25 <= 250.4) return { level: 'Very Unhealthy', color: '#a855f7', textColor: '#9333ea' };
    return { level: 'Hazardous', color: '#991b1b', textColor: '#991b1b' };
  };

  const prepareHourlyData = () => {
    if (!weatherData?.hourly) return [];
    
    return weatherData.hourly.time.slice(0, 24).map((time, idx) => ({
      time: new Date(time).getHours() + ':00',
      temperature: Math.round(weatherData.hourly.temperature_2m[idx]),
      humidity: weatherData.hourly.relative_humidity_2m[idx],
      precipitation: weatherData.hourly.precipitation_probability[idx]
    }));
  };

  const prepareAQIData = () => {
    if (!airQuality?.current) return [];
    
    return [
      { name: 'PM2.5', value: airQuality.current.pm2_5 || 0, color: '#ef4444' },
      { name: 'PM10', value: airQuality.current.pm10 || 0, color: '#f97316' },
      { name: 'NO₂', value: airQuality.current.nitrogen_dioxide || 0, color: '#eab308' },
      { name: 'O₃', value: airQuality.current.ozone || 0, color: '#22c55e' },
      { name: 'CO', value: (airQuality.current.carbon_monoxide || 0) / 10, color: '#3b82f6' }
    ];
  };

  const computeComfortScore = (temp, humidity) => {
    if (temp == null || humidity == null) return 50;

    const idealTemp = 24;
    const idealHum = 50;

    const tempPenalty = Math.min(40, Math.abs(temp - idealTemp) * 3);
    const humPenalty = Math.min(40, Math.abs(humidity - idealHum) * 1.2);

    const raw = 100 - (tempPenalty + humPenalty);
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  const calculateIndoorComfort = (current) => {
    if (!current) {
      return {
        score: 50,
        recommendation: 'Waiting for data...',
      };
    }

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const score = computeComfortScore(temp, humidity);

    let recommendation = '';

    if (score >= 80) {
      recommendation =
        'Very comfortable. You can keep windows slightly open and use fan at low speed.';
    } else if (score >= 60) {
      recommendation =
        'Moderately comfortable. Fan at medium speed; AC optional if you feel warm.';
    } else if (score >= 40) {
      recommendation =
        'A bit uncomfortable. Consider closing curtains and using fan/AC.';
    } else {
      recommendation =
        'Uncomfortable conditions. Use AC (or strongest ventilation) and keep windows mostly closed.';
    }

    return { score, recommendation };
  };

  const getHourlyComfortSeries = () => {
    if (!weatherData?.hourly) return [];

    return weatherData.hourly.time.slice(0, 24).map((time, idx) => {
      const temp = weatherData.hourly.temperature_2m[idx];
      const hum = weatherData.hourly.relative_humidity_2m[idx];
      const uv = weatherData.hourly.uv_index?.[idx] || 0;
      return {
        time,
        hour: new Date(time).getHours(),
        temperature: temp,
        humidity: hum,
        uv: uv,
        comfort: computeComfortScore(temp, hum),
        precipitation: weatherData.hourly.precipitation_probability[idx],
      };
    });
  };

  const suggestBestHours = (series, filterFn, label) => {
    if (!series.length) return null;

    const filtered = series.filter(filterFn).sort((a, b) => b.comfort - a.comfort);

    if (!filtered.length) return null;

    const best = filtered[0];
    return {
      label,
      hour: `${best.hour}:00`,
      comfort: best.comfort,
    };
  };

  const getLifeAssistantSuggestions = () => {
    const series = getHourlyComfortSeries();
    if (!series.length) return [];

    const suggestions = [];

    const run = suggestBestHours(
      series,
      (h) =>
        h.temperature >= 15 &&
        h.temperature <= 28 &&
        h.humidity <= 70 &&
        h.precipitation < 30,
      'Best time to run',
    );
    if (run) suggestions.push(run);

    const walk = suggestBestHours(
      series,
      (h) => h.temperature >= 18 && h.temperature <= 32 && h.comfort >= 60,
      'Best time for a walk',
    );
    if (walk) suggestions.push(walk);

    const study = suggestBestHours(
      series,
      (h) => h.temperature >= 20 && h.temperature <= 30 && h.comfort >= 65,
      'Best outdoor study time',
    );
    if (study) suggestions.push(study);

    const travel = suggestBestHours(
      series,
      (h) => h.precipitation < 40 && h.comfort >= 55,
      'Best time to travel',
    );
    if (travel) suggestions.push(travel);

    // Best time to dry clothes - needs UV, low humidity, wind, no rain
    const dryClothes = suggestBestHours(
      series,
      (h) => {
        const uv = weatherData?.hourly?.uv_index?.[series.indexOf(h)] || 0;
        return h.humidity <= 60 && h.precipitation < 20 && uv > 2 && h.temperature >= 20;
      },
      'Best time to dry clothes',
    );
    if (dryClothes) suggestions.push(dryClothes);

    return suggestions;
  };

  const calculateActivityScores = () => {
    const current = weatherData?.current;
    if (!current || !airQuality?.current) return [];

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m;
    const pm25 = airQuality.current.pm2_5 || 0;
    const uv = current.uv_index || 0;

    const baseComfort = computeComfortScore(temp, humidity);

    const airPenalty = pm25 <= 35 ? 0 : pm25 <= 55 ? 10 : pm25 <= 150 ? 25 : 40;
    const safeComfort = Math.max(0, baseComfort - airPenalty);

    const score = (modifier) => {
      const s = Math.max(0, Math.min(100, Math.round(safeComfort + modifier)));
      return s;
    };

    return [
      {
        name: 'Running',
        score: score(
          (temp >= 18 && temp <= 26 ? 5 : -10) +
            (humidity <= 70 ? 5 : -5) +
            (wind >= 5 && wind <= 20 ? 5 : 0) -
            (uv > 8 ? 10 : uv > 6 ? 5 : 0),
        ),
      },
      {
        name: 'Cycling',
        score: score(
          (temp >= 15 && temp <= 28 ? 8 : -8) +
            (humidity <= 70 ? 5 : -5) +
            (wind >= 3 && wind <= 20 ? 5 : wind > 25 ? -10 : 0) -
            (uv > 8 ? 10 : uv > 6 ? 5 : 0),
        ),
      },
      {
        name: 'Walking',
        score: score(
          (temp >= 18 && temp <= 32 ? 8 : -5) + (humidity <= 75 ? 3 : -3) -
            (uv > 8 ? 8 : uv > 6 ? 4 : 0),
        ),
      },
      {
        name: 'Outdoor Study',
        score: score(
          (temp >= 20 && temp <= 30 ? 10 : -10) +
            (humidity <= 65 ? 5 : -5) -
            (pm25 > 55 ? 10 : 0) -
            (uv > 7 ? 8 : 0),
        ),
      },
      {
        name: 'Outdoor Sports',
        score: score(
          (temp >= 18 && temp <= 30 ? 8 : -8) + (wind <= 25 ? 3 : -5) -
            (uv > 8 ? 10 : uv > 6 ? 5 : 0),
        ),
      },
      {
        name: 'Photography',
        score: score(
          (current.cloud_cover >= 20 && current.cloud_cover <= 80 ? 8 : 0) +
            (uv >= 3 && uv <= 7 ? 5 : 0),
        ),
      },
    ];
  };

  const estimateDryingTimeHours = () => {
    const current = weatherData?.current;
    if (!current || !weatherData?.hourly) return null;

    const avgHum =
      weatherData.hourly.relative_humidity_2m.slice(0, 12).reduce((a, b) => a + b, 0) /
      12;
    const avgUV =
      weatherData.hourly.uv_index?.slice(0, 12).reduce((a, b) => a + b, 0) / 12 || 0;

    const temp = current.temperature_2m;
    const wind = current.wind_speed_10m;

    let base = 6;

    if (avgHum >= 80) base += 4;
    else if (avgHum >= 60) base += 2;
    else if (avgHum <= 40) base -= 1;

    if (temp >= 32) base -= 2;
    else if (temp >= 26) base -= 1;
    else if (temp <= 18) base += 2;

    if (wind >= 15) base -= 1;
    else if (wind <= 4) base += 1;

    // UV index helps drying - higher UV = faster drying
    if (avgUV >= 6) base -= 1.5;
    else if (avgUV >= 4) base -= 1;
    else if (avgUV <= 2) base += 0.5;

    base = Math.max(2, Math.min(18, base));
    return Math.round(base);
  };

  const getProductivityWindow = () => {
    const series = getHourlyComfortSeries();
    if (!series.length) return null;

    const lateMorning = series.filter((h) => h.hour >= 9 && h.hour <= 12);
    const afternoon = series.filter((h) => h.hour >= 14 && h.hour <= 18);

    const avgComfort = (arr) =>
      arr.length ? arr.reduce((s, h) => s + h.comfort, 0) / arr.length : 0;

    const lm = avgComfort(lateMorning);
    const af = avgComfort(afternoon);

    if (!lm && !af) return null;

    // Calculate mood/productivity score based on comfort, temperature stability, and sunlight
    const calculateMoodScore = (arr) => {
      if (!arr.length) return 0;
      const avgTemp = arr.reduce((s, h) => s + h.temperature, 0) / arr.length;
      const tempStability = 100 - Math.max(0, arr.reduce((max, h) => 
        Math.max(max, Math.abs(h.temperature - avgTemp)), 0) * 5);
      const avgComfort = arr.reduce((s, h) => s + h.comfort, 0) / arr.length;
      const sunlight = arr.reduce((s, h) => s + (h.uv || 0), 0) / arr.length;
      
      // Mood is better with stable temps, good comfort, and moderate sunlight
      return Math.round((avgComfort * 0.5 + tempStability * 0.3 + Math.min(sunlight * 5, 20)) * 0.8);
    };

    const lmMood = calculateMoodScore(lateMorning);
    const afMood = calculateMoodScore(afternoon);

    let bestWindow, bestMood;
    if (lm >= af && lmMood >= afMood) {
      bestWindow = { label: 'Best focus window', time: '09:00 – 12:00', comfort: Math.round(lm) };
      bestMood = lmMood;
    } else {
      bestWindow = { label: 'Best focus window', time: '14:00 – 18:00', comfort: Math.round(af) };
      bestMood = afMood;
    }

    // Add mood prediction
    let moodPrediction = '';
    if (bestMood >= 70) moodPrediction = 'High energy & focus expected';
    else if (bestMood >= 50) moodPrediction = 'Moderate productivity likely';
    else moodPrediction = 'Lower energy - take breaks';

    return {
      ...bestWindow,
      mood: bestMood,
      moodPrediction: moodPrediction,
    };
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #581c87, #9d174d)',
      padding: '2rem'
    },
    loadingContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #312e81, #581c87, #9d174d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      borderRadius: '9999px',
      height: '64px',
      width: '64px',
      borderTop: '4px solid white',
      margin: '0 auto 1rem'
    },
    loadingText: {
      color: 'white',
      fontSize: '1.25rem',
      textAlign: 'center'
    },
    errorCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      padding: '2rem',
      borderRadius: '1rem'
    },
    errorText: {
      color: 'white',
      fontSize: '1.25rem'
    },
    retryButton: {
      marginTop: '1rem',
      padding: '0.5rem 1.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '0.5rem',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    maxWidth: {
      maxWidth: '80rem',
      margin: '0 auto'
    },
    headerCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '2rem'
    },
    headerFlex: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem'
    },
    select: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: '0.75rem',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      outline: 'none'
    },
    updateText: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.75rem',
      textAlign: 'center',
      marginTop: '0.75rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    gridLg: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem'
    },
    weatherCard: {
      background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      height: '100%'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      height: '100%'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    temperature: {
      textAlign: 'center',
      margin: '2rem 0'
    },
    tempValue: {
      fontSize: '4.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem'
    },
    feelsLike: {
      fontSize: '1.25rem',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    },
    statCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.75rem',
      padding: '0.75rem'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.25rem'
    },
    statLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white'
    },
    aqiBadge: {
      display: 'inline-block',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      marginBottom: '0.5rem'
    },
    aqiValue: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem',
      textAlign: 'center'
    },
    pollutantItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      marginBottom: '0.75rem'
    },
    pollutantHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    pollutantName: {
      color: 'white',
      fontWeight: '600'
    },
    pollutantValue: {
      color: 'white',
      fontWeight: 'bold'
    },
    progressBar: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '9999px',
      height: '8px'
    },
    progressFill: {
      height: '8px',
      borderRadius: '9999px',
      transition: 'width 0.5s'
    },
    footer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      padding: '1rem',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: '2rem'
    },
    footerText: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.875rem'
    }
  };

  if (loading && !weatherData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading Smart City Data...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorCard}>
          <AlertCircle style={{ width: '64px', height: '64px', color: '#f87171', margin: '0 auto 1rem', display: 'block' }} />
          <p style={styles.errorText}>{error}</p>
          <button 
            onClick={() => fetchCityData(selectedCity)}
            style={styles.retryButton}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const current = weatherData?.current;
  const aqiLevel = airQuality?.current ? getAQILevel(airQuality.current.pm2_5) : null;
  const indoorComfort = calculateIndoorComfort(current);
  const activityScores = calculateActivityScores();
  const lifeAssistantSuggestions = getLifeAssistantSuggestions();
  const dryingTime = estimateDryingTimeHours();
  const productivityWindow = getProductivityWindow();
  const currentCity = indianCities.find((c) => c.name === selectedCity);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.maxWidth}>
        <div style={styles.headerCard}>
          <div style={styles.headerFlex}>
            <div>
              <h1 style={styles.title}>
                <Activity style={{ width: '40px', height: '40px' }} />
                Smart City Dashboard
              </h1>
              <p style={styles.subtitle}>Real-time Environmental & Weather Monitoring</p>
            </div>
            
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={styles.select}
              >
                {indianCities.map(city => (
                  <option key={city.name} value={city.name} style={{ background: '#581c87' }}>
                    {city.name}
                  </option>
                ))}
              </select>
              <p style={styles.updateText}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.maxWidth}>
        <div style={styles.gridLg} className="grid-responsive">
          
          <div style={{ gridColumn: 'span 1' }}>
            <div style={styles.weatherCard}>
              <div style={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: 'white' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{selectedCity}</h2>
                </div>
                {getWeatherIcon(current?.weather_code)}
              </div>
              
              <div style={styles.temperature}>
                <div style={styles.tempValue}>
                  {Math.round(current?.temperature_2m)}°
                </div>
                <p style={styles.feelsLike}>
                  Feels like {Math.round(current?.apparent_temperature)}°
                </p>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <Droplets style={{ width: '16px', height: '16px', color: '#93c5fd' }} />
                    <span style={styles.statLabel}>Humidity</span>
                  </div>
                  <p style={styles.statValue}>{current?.relative_humidity_2m}%</p>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <Wind style={{ width: '16px', height: '16px', color: '#86efac' }} />
                    <span style={styles.statLabel}>Wind</span>
                  </div>
                  <p style={styles.statValue}>{Math.round(current?.wind_speed_10m)} km/h</p>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <Gauge style={{ width: '16px', height: '16px', color: '#fde047' }} />
                    <span style={styles.statLabel}>Pressure</span>
                  </div>
                  <p style={styles.statValue}>{Math.round(current?.pressure_msl)} hPa</p>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <Cloud style={{ width: '16px', height: '16px', color: '#d1d5db' }} />
                    <span style={styles.statLabel}>Cloud Cover</span>
                  </div>
                  <p style={styles.statValue}>{current?.cloud_cover}%</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <TrendingUp style={{ width: '24px', height: '24px' }} />
                24-Hour Forecast
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={prepareHourlyData()}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" name="Temperature (°C)" />
                  <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumidity)" name="Humidity (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <Eye style={{ width: '24px', height: '24px' }} />
                Air Quality Index
              </h3>
              
              {aqiLevel && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                  <div style={{ ...styles.aqiBadge, backgroundColor: aqiLevel.color }}>
                    {aqiLevel.level}
                  </div>
                  <p style={styles.aqiValue}>PM2.5: {Math.round(airQuality.current.pm2_5)} µg/m³</p>
                </div>
              )}

              <div>
                {prepareAQIData().map((item, idx) => (
                  <div key={idx} style={styles.pollutantItem}>
                    <div style={styles.pollutantHeader}>
                      <span style={styles.pollutantName}>{item.name}</span>
                      <span style={styles.pollutantValue}>{Math.round(item.value)}</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div 
                        style={{ 
                          ...styles.progressFill,
                          width: `${Math.min(100, (item.value / 100) * 100)}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <Activity style={{ width: '24px', height: '24px' }} />
                Pollutant Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareAQIData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {prepareAQIData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Thermometer style={{ width: '24px', height: '24px' }} />
                  Indoor Comfort
                </h3>
              </div>
              <p
                style={{
                  color: 'white',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                {indoorComfort.score}/100
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                {indoorComfort.recommendation}
              </p>
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Activity style={{ width: '24px', height: '24px' }} />
                  Life Assistant
                </h3>
              </div>
              {lifeAssistantSuggestions && lifeAssistantSuggestions.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {lifeAssistantSuggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      style={{
                        marginBottom: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <p
                        style={{
                          color: 'white',
                          fontWeight: '600',
                          marginBottom: '0.15rem',
                        }}
                      >
                        {sug.label}
                      </p>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.8rem',
                        }}
                      >
                        Around <strong>{sug.hour}</strong> (comfort {sug.comfort}
                        /100)
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Waiting for forecast to generate suggestions...
                </p>
              )}
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <CloudRain style={{ width: '24px', height: '24px' }} />
                  Clothes Drying Time
                </h3>
              </div>
              {dryingTime ? (
                <>
                  <p
                    style={{
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    ~{dryingTime} hours
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Estimate based on next 12 hours of humidity, current temperature,
                    and wind speed.
                  </p>
                </>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Waiting for forecast data...
                </p>
              )}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Activity style={{ width: '24px', height: '24px' }} />
                  Outdoor Activity Suitability
                </h3>
              </div>
              {activityScores && activityScores.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {activityScores.map((act) => (
                    <div
                      key={act.name}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.8rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {act.name}
                      </p>
                      <p
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.4rem',
                        }}
                      >
                        {act.score}
                      </p>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${act.score}%`,
                            backgroundColor:
                              act.score >= 80
                                ? '#22c55e'
                                : act.score >= 60
                                ? '#eab308'
                                : '#f97316',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Waiting for current conditions...
                </p>
              )}
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Sun style={{ width: '24px', height: '24px' }} />
                  Productivity Predictor
                </h3>
              </div>
              {productivityWindow ? (
                <>
                  <p
                    style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {productivityWindow.label}
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {productivityWindow.time}
                  </p>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Weather comfort: {productivityWindow.comfort}/100
                  </p>
                  {productivityWindow.moodPrediction && (
                    <>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Mood & Energy: {productivityWindow.mood}/100
                      </p>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                        }}
                      >
                        {productivityWindow.moodPrediction}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Will suggest a focus window once data loads.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.maxWidth}>
        <div style={styles.card}>
          <CrowdReports
            city={selectedCity}
            lat={currentCity?.lat}
            lon={currentCity?.lon}
          />
        </div>
      </div>

      <div style={styles.maxWidth}>
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Data sources: Open-Meteo Weather API • Open-Meteo Air Quality API • Auto-refreshes every 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartCityDashboard;