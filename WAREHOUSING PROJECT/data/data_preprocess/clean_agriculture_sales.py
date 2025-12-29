import pandas as pd

df = pd.read_csv("/Users/parth/Desktop/WAREHOUSING PROJECT/data/raw/AgricultureData.csv")

df = df[['product_name', 'sale_date', 'units_sold_kg']]

df = df.rename(columns={
    'sale_date': 'date',
    'units_sold_kg': 'quantity_sold'
})

df['product_name'] = df['product_name'].str.strip().str.title()
df['date'] = pd.to_datetime(df['date'], errors='coerce')

df = df.dropna(subset=['product_name', 'date', 'quantity_sold'])
df = df[df['quantity_sold'] > 0]

df = df.sort_values(by=['product_name', 'date'])

df.to_csv("/Users/parth/Desktop/WAREHOUSING PROJECT/data/cleaned/sales_clean.csv", index=False)

print("Sales CSV cleaned:", len(df))
