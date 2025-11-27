# Troubleshooting "Failed to load reports" Error

## Quick Fixes

### 1. **Backend Server Not Running**

Make sure your Django backend is running:

```bash
cd backend
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### 2. **Backend Dependencies Not Installed**

Install required packages:

```bash
cd backend
pip install -r requirements.txt
```

Or if using virtual environment:

```bash
cd backend
# Activate virtual environment first
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Then install
pip install -r requirements.txt
```

### 3. **Check API Base URL**

Verify the API_BASE URL in your frontend:
- Default: `http://localhost:8000/api`
- Check browser console for the actual URL being used
- Make sure it matches your backend server URL

### 4. **CORS Issues**

If you see CORS errors in browser console:
- Backend already has CORS configured (`CORS_ALLOW_ALL_ORIGINS = True`)
- Make sure `corsheaders` is in `INSTALLED_APPS` in `settings.py`
- Make sure `CorsMiddleware` is first in `MIDDLEWARE`

### 5. **Database Migrations**

Run migrations if you haven't:

```bash
cd backend
python manage.py migrate
```

### 6. **Check Backend Logs**

Look at the Django server console for error messages. Common issues:
- Import errors
- Database errors
- URL routing errors

## Testing Backend Manually

### Test Health Endpoint:
```bash
curl http://localhost:8000/api/health/
```

Should return: `{"status":"ok"}`

### Test Reports Endpoint:
```bash
curl http://localhost:8000/api/reports/?city=Delhi
```

Should return: `[]` (empty array if no reports) or a list of reports

## Common Error Messages

### "Cannot connect to backend"
- **Solution**: Start the Django server with `python manage.py runserver`

### "ModuleNotFoundError: No module named 'rest_framework'"
- **Solution**: Install dependencies with `pip install -r requirements.txt`

### "Network Error" or "ERR_CONNECTION_REFUSED"
- **Solution**: Backend server is not running or wrong port

### CORS Error
- **Solution**: Already configured, but check if backend is running

## Step-by-Step Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Start server:**
   ```bash
   python manage.py runserver
   ```

5. **In another terminal, start frontend:**
   ```bash
   npm start
   ```

6. **Test in browser:**
   - Open `http://localhost:3000`
   - Check browser console (F12) for errors
   - Check network tab to see API requests

## Still Having Issues?

1. Check browser console (F12) for detailed error messages
2. Check Django server console for backend errors
3. Verify `API_BASE` environment variable matches your backend URL
4. Make sure both frontend and backend are running simultaneously

