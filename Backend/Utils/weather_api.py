import requests

def get_weather(city_name, api_key):
    """
    Fetches current Temperature (C) and Humidity (%) for a city.
    """
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        'q': city_name,
        'appid': api_key,
        'units': 'metric'
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=3)
        if response.status_code == 200:
            data = response.json()
            return {
                "temp": data['main']['temp'],
                "humidity": data['main']['humidity'],
                "description": data['weather'][0]['description']
            }
        else:
            return None
    except Exception as e:
        print(f"Weather API Error: {e}")
        return None