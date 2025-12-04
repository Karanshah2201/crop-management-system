import requests

def get_weather(city_name, api_key):
    """
    Fetches current Temperature (C) and Humidity (%) for a city.
    """
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        'q': city_name,
        'appid': '929eff2ab5508fe7f20a5f057d4876a8',
        'units': 'metric'
    }
    
    try:
        response = requests.get(base_url, params=params)
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