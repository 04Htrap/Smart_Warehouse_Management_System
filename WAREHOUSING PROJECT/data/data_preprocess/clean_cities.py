import pandas as pd

df = pd.read_csv("/Users/parth/Desktop/WAREHOUSING PROJECT/data/raw/indian_cities.csv")

df = df[['City', 'Lat', 'Long']]
df = df.dropna(subset=['Lat', 'Long'])

df['City'] = df['City'].str.strip().str.title()
df = df.drop_duplicates(subset=['City', 'Lat', 'Long'])

df = df.rename(columns={
    'City': 'name',
    'Lat': 'Lat',
    'Long': 'Long'
})

df = df.rename(columns={
    'Lat': 'Latitude',
    'Long': 'Longitude'
})

df = df.sample(n=100, random_state=42)

df.to_csv("/Users/parth/Desktop/WAREHOUSING PROJECT/data/cleaned/indian_cities_clean.csv", index=False)

print("Cleaning complete. Cities saved:", len(df))
