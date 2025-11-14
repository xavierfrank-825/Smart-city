import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Eye, Gauge, Sun, Moon, CloudRain, CloudSnow, Zap, Navigation, Thermometer, Activity, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,pressure_msl&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&timezone=Asia/Kolkata&forecast_days=1`
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