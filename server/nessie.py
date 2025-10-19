from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import requests
import random
from datetime import date, timedelta
from faker import Faker
import os

app = FastAPI(title="Nessie Customer Proxy")

BASE_URL = "http://api.nessieisreal.com"
API_KEY = VITE_NESSIE_API_KEY
API_KEY = os.getenv("VITE_NESSIE_API_KEY")

f = Faker()

class Address(BaseModel):
    street_number: str
    street_name: str
    city: str
    state: str
    zip: str

class Customer(BaseModel):
    first_name: str
    last_name: str
    address: Address

class Account(BaseModel):
    type: str = "Credit Card"
    nickname: str
    rewards: int = 0
    balance: int = 0

class Purchase(BaseModel):
    merchant_id: str
    medium: str = "balance"
    purchase_date: str
    amount: float
    status: str = "completed"
    description: str

class UpdateAddress(BaseModel):
    street_number: Optional[str] = None
    street_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None


MERCHANTS = {
    'restaurants': {
        'merchant_001': 'Chick-fil-A',
        'merchant_002': 'McDonalds',
        'merchant_003': 'Chipotle',
        'merchant_004': 'Olive Garden'
    },
    'travel': {
        'merchant_005': 'United Airlines',
        'merchant_006': 'Delta',
        'merchant_007': 'Southwest',
        'merchant_008': 'American Airlines'
    },
    'hotel': {
        'merchant_009': 'Marriott',
        'merchant_010': 'Hilton',
        'merchant_011': 'Hyatt',
        'merchant_012': 'Holiday Inn'
    },
    'streaming-services': {
        'merchant_013': 'Netflix',
        'merchant_014': 'Spotify',
        'merchant_015': 'Disney+',
        'merchant_016': 'Hulu'
    },
    'groceries': {
        'merchant_017': 'Whole Foods',
        'merchant_018': 'Trader Joes',
        'merchant_019': 'HEB',
        'merchant_020': 'Kroger'
    },
    'gas': {
        'merchant_021': 'Shell',
        'merchant_022': 'Exxon',
        'merchant_023': 'Chevron',
        'merchant_024': 'BP'
    },
    'online-shopping': {
        'merchant_025': 'Amazon',
        'merchant_026': 'eBay',
        'merchant_027': 'Etsy',
        'merchant_028': 'Target.com'
    },
    'airport-lounge': {
        'merchant_029': 'Delta Sky Club',
        'merchant_030': 'United Club'
    }
}

CATEGORIES = list(MERCHANTS.keys())

def pick_merchant(category):
    """Pick a random merchant from a category and return (merchant_id, merchant_name)"""
    merchant_dict = MERCHANTS.get(category, {})
    if not merchant_dict:
        return ('merchant_generic', 'Generic Merchant')
    merchant_id = random.choice(list(merchant_dict.keys()))
    merchant_name = merchant_dict[merchant_id]
    return (merchant_id, merchant_name)

def generate_random_date_in_past_month():
    """Generate a random date within the past 30 days"""
    today = date.today()
    days_ago = random.randint(0, 30)
    return str(today - timedelta(days=days_ago))

# Create customer
@app.post("/customers")
def create_customer(customer: Customer):
    """Create a new customer in Nessie API"""
    url = f"{BASE_URL}/customers?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=customer.dict())
    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

# Get all customers
@app.get("/customers")
def get_all_customers():
    """Get all customers from Nessie API"""
    url = f"{BASE_URL}/customers?key={API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

# Get customer by ID
@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    """Get a specific customer by ID from Nessie API"""
    url = f"{BASE_URL}/customers/{customer_id}?key={API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

@app.put("/customers/{customer_id}")
def update_customer(customer_id: str, address: UpdateAddress):
    """Update a customer's address"""
    url = f"{BASE_URL}/customers/{customer_id}?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    body = {k: v for k, v in address.dict().items() if v is not None}
    if not body:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    response = requests.put(url, headers=headers, json={"address": body})
    if response.status_code != 202:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

# Create customer account
@app.post("/customers/{customer_id}/accounts")
def create_account(customer_id: str, account: Account):
    """Create an account for a specific customer"""
    url = f"{BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=account.dict())
    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

@app.get("/customers/{customer_id}/accounts")
def get_customer_accounts(customer_id: str):
    """Get all accounts for a specific customer"""
    url = f"{BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

@app.post("/accounts/{account_id}/purchases")
def create_purchase(account_id: str, purchase: Purchase):
    """Create a single purchase for a specific account"""
    url = f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=purchase.dict())
    if response.status_code not in [200, 201]:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

@app.get("/accounts/{account_id}/purchases")
def get_account_purchases(account_id: str):
    """Get all purchases for a specific account"""
    url = f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

# Generate purchase data
@app.get("/customers/{customer_id}/purchase_data")
def generate_purchase_data(customer_id: str):
    url = f"{BASE_URL}/customers/{customer_id}?key={API_KEY}"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    
    customer_data = response.json()
    num_purchases = random.randint(10, 30)
    print(f"Generating {num_purchases} fake purchases")
    
    purchases = []
    
    for i in range(num_purchases):
        category = random.choice(CATEGORIES)
        merchant_id, merchant_name = pick_merchant(category)
        
        purchase = {
            "merchant_id": merchant_id,
            "merchant_name": merchant_name,
            "category": category,
            "medium": "balance",
            "purchase_date": generate_random_date_in_past_month(),
            "amount": round(random.uniform(5, 500), 2),
            "status": "completed",
            "description": f"{merchant_name} - {category}"
        }
        purchases.append(purchase)
        
    result = {
        "customer_id": customer_id,
        "customer_name": f"{customer_data['first_name']} {customer_data['last_name']}",
        "num_purchases": num_purchases,
        "purchases": purchases
    }
    
    
    return result

# Generate fake user
@app.post("/generate_fake_user")
def generate_fake_user():
    """
    All-in-one endpoint: Creates a fake customer, account, and 10-30 purchases in Nessie.
    """
    customer_data = {
        "first_name": f.first_name(),
        "last_name": f.last_name(),
        "address": {
            "street_number": str(random.randint(1, 9999)),
            "street_name": f.street_name(),
            "city": f.city(),
            "state": f.state_abbr(),
            "zip": f.zipcode()
        }
    }
    cust_resp = requests.post(f"{BASE_URL}/customers?key={API_KEY}", json=customer_data)
    if cust_resp.status_code != 201:
        raise HTTPException(status_code=cust_resp.status_code, detail=cust_resp.json())
    customer = cust_resp.json()["objectCreated"]
    customer_id = customer["_id"]

    account_data = {
        "type": "Credit Card",
        "nickname": f"{f.first_name()}'s Credit Card",
        "rewards": random.randint(0, 500),
        "balance": 0
    }
    acc_resp = requests.post(f"{BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}", json=account_data)
    if acc_resp.status_code != 201:
        raise HTTPException(status_code=acc_resp.status_code, detail=acc_resp.json())
    account = acc_resp.json()["objectCreated"]
    account_id = account["_id"]

    purchases = []
    for _ in range(random.randint(10, 30)):
        category = random.choice(CATEGORIES)
        merchant_id, merchant_name = pick_merchant(category)
        purchase_data = {
            "merchant_id": merchant_id,
            "medium": "balance",
            "purchase_date": generate_random_date_in_past_month(),
            "amount": round(random.uniform(5, 500), 2),
            "status": "completed",
            "description": f"{merchant_name} - {category}"
        }
        pur_resp = requests.post(f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}", json=purchase_data)
        if pur_resp.status_code not in [200, 201]:
            raise HTTPException(status_code=pur_resp.status_code, detail=pur_resp.json())
        purchases.append(pur_resp.json())

    return {
        "customer": customer,
        "account": account,
        "purchases": purchases,
        "summary": {
            "customer_id": customer_id,
            "account_id": account_id,
            "num_purchases": len(purchases)
        }
    }