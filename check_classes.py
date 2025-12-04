import joblib
try:
    model_data = joblib.load('Backend/models/crop_recommendation_model.pkl')
    print("Classes:", model_data['model'].classes_)
except Exception as e:
    print(e)
