import csv
import datetime
import random
import os

random.seed(42)

regions = ["North", "South", "East", "West", "Central"]
states = {
    "North": ["Delhi", "Punjab", "Haryana", "Himachal Pradesh"],
    "South": ["Karnataka", "Tamil Nadu", "Telangana", "Kerala"],
    "East": ["West Bengal", "Odisha", "Bihar", "Assam"],
    "West": ["Maharashtra", "Gujarat", "Rajasthan", "Goa"],
    "Central": ["Madhya Pradesh", "Chhattisgarh", "Uttar Pradesh"]
}

categories = {
    "Technology": ["Laptops", "Smartphones", "Accessories", "Printers"],
    "Furniture": ["Chairs", "Tables", "Bookcases", "Furnishings"],
    "Office Supplies": ["Paper", "Binders", "Storage", "Appliances", "Art"]
}

customer_names = [
    "Aarav Sharma", "Diya Patel", "Rohan Mehta", "Ananya Iyer", "Vikram Rao",
    "Priya Nair", "Aditya Verma", "Sneha Kulkarni", "Karan Malhotra", "Ishita Gupta",
    "Siddharth Das", "Neha Reddy", "Rahul Joshi", "Kavya Menon", "Arjun Bansal"
]

segments = ["Consumer", "Corporate", "Home Office"]

start_date = datetime.date(2025, 1, 1)
end_date = datetime.date(2026, 9, 30)
delta_days = (end_date - start_date).days

rows = []
for i in range(1, 601):
    order_id = f"IN-2025-{1000 + i}"
    rand_day = random.randint(0, delta_days)
    order_date = start_date + datetime.timedelta(days=rand_day)
    ship_date = order_date + datetime.timedelta(days=random.randint(1, 5))
    
    region = random.choice(regions)
    state = random.choice(states[region])
    customer = random.choice(customer_names)
    cust_id = f"CUST-{hash(customer) % 900 + 100}"
    segment = random.choice(segments)
    
    category = random.choice(list(categories.keys()))
    sub_category = random.choice(categories[category])
    prod_id = f"PROD-{category[:3].upper()}-{random.randint(10, 99)}"
    
    # Base sales by category
    if category == "Technology":
        base_price = random.uniform(300, 1800)
    elif category == "Furniture":
        base_price = random.uniform(150, 900)
    else:
        base_price = random.uniform(20, 250)
        
    quantity = random.randint(1, 8)
    discount = random.choice([0.0, 0.05, 0.1, 0.15, 0.2, 0.3])
    sales = round(base_price * quantity * (1 - discount), 2)
    
    # Profit calculation with realistic margins
    cost = base_price * quantity * random.uniform(0.65, 0.85)
    profit = round(sales - cost, 2)
    
    # Inject a couple of realistic business anomalies
    if i in [142, 388]: # Massive flash sale spike
        sales = round(sales * 6.5, 2)
        profit = round(profit * 5.2, 2)
    elif i in [215, 490]: # Massive loss order due to extreme discount
        discount = 0.60
        sales = round(base_price * quantity * 0.40, 2)
        profit = round(sales - (base_price * quantity * 0.80), 2) # severe loss
        
    # Introduce a few mild data quality issues for data cleaning showcase
    cust_display = customer
    if i == 50:
        cust_display = f" {customer}  " # Trailing whitespace
    sales_val = sales
    profit_val = profit
    if i == 85:
        profit_val = None # Missing value
    if i == 120:
        sales_val = f"${sales}" # Currency string format issue
        
    rows.append([
        order_id, str(order_date), str(ship_date), cust_id, cust_display,
        segment, "India", state, region, prod_id, category, sub_category,
        sub_category + " Item", sales_val, quantity, discount, profit_val
    ])

# Sort rows chronologically
rows.sort(key=lambda r: r[1])

target_file = r"C:\Users\singi\.gemini\antigravity\scratch\insightflow-ai\sample_data\superstore_sales.csv"
os.makedirs(os.path.dirname(target_file), exist_ok=True)

with open(target_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "order_id", "order_date", "ship_date", "customer_id", "customer_name",
        "segment", "country", "state", "region", "product_id", "category",
        "sub_category", "product_name", "sales", "quantity", "discount", "profit"
    ])
    writer.writerows(rows)

print(f"Sample dataset generated successfully: {len(rows)} rows.")

