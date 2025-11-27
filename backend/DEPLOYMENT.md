# Backend Deployment Guide

## Deployment to Railway/Render/Heroku

### Prerequisites
- Git repository
- Account on Railway, Render, or Heroku

### Environment Variables
Set these in your hosting platform:

- `SECRET_KEY`: Django secret key (generate a new one for production)
- `DEBUG`: Set to `False` for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts (e.g., `your-app.railway.app,your-app.onrender.com`)

### Deployment Steps

#### For Railway:
1. Connect your GitHub repository
2. Select the `backend` folder as the root directory
3. Railway will auto-detect Python
4. Add environment variables
5. Deploy!

#### For Render:
1. Create a new Web Service
2. Connect your repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn weather_backend.wsgi`
4. Add environment variables
5. Deploy!

#### For Heroku:
```bash
cd backend
heroku create your-app-name
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=your-app.herokuapp.com
git push heroku main
```

### Generate Secret Key
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### After Deployment
1. Get your backend URL (e.g., `https://your-backend.railway.app`)
2. Update your frontend's `REACT_APP_API_BASE` environment variable in Vercel
3. Test the API: `https://your-backend-url/api/health`

