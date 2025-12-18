import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import os

# 1. Load the Dataset
# We use the path relative to where you run the script, or an absolute path
# Make sure 'data_core.csv' is in Backend/Data/Raw/
file_path = 'Data/Raw/data_core.csv' 
df = pd.read_csv(file_path)

print("Dataset loaded successfully.")

# 2. Data Preprocessing
# Your dataset has a text column 'Soil Type' that needs to be numbers for the machine to understand.
# We will use "One-Hot Encoding" for Soil Type.
df_encoded = pd.get_dummies(df, columns=['Soil Type'], prefix='Soil')

# Define your Inputs (Features) and Output (Target)
# We drop 'Crop Type' (Target) and 'Fertilizer Name' (Not needed for crop prediction)
X = df_encoded.drop(['Crop Type', 'Fertilizer Name'], axis=1)
y = df_encoded['Crop Type']

# 3. Split Data into Training and Testing Sets
# 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Initialize and Train the Model
# RandomForest is excellent for this type of classification task
model = RandomForestClassifier(n_estimators=100, random_state=42)
print("Training the model... this might take a moment.")
model.fit(X_train, y_train)

# 5. Evaluate the Model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Training Complete! Accuracy: {accuracy * 100:.2f}%")

# 6. Save the Model and Column Info
# We must save the model AND the list of columns. 
# Why? Because when the user sends data later, we need to match the 'Soil Type' columns exactly.
model_data = {
    'model': model,
    'columns': X.columns.tolist() 
}
# Save to Models folder
os.makedirs('Models', exist_ok=True)
joblib.dump(model_data, 'Models/crop_recommendation_model.pkl')
print("Model saved as 'Models/crop_recommendation_model.pkl'")