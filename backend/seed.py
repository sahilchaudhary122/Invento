"""
Invento Backend Seeder Script
Seeds realistic demo data (Warehouses, Locations, Categories, Products) for the hackathon demo.
"""

import requests

BASE_URL = "http://127.0.0.1:8000"

# Data definitions
WAREHOUSES = [
    {
        "name": "Main Warehouse",
        "code": "WH-MAIN",
        "address": "123 Industrial Ave, Mumbai",
        "is_primary": True,
    },
    {
        "name": "Secondary Warehouse",
        "code": "WH-SEC",
        "address": "45 Storage Rd, Pune",
        "is_primary": False,
    },
    {
        "name": "Production Floor",
        "code": "WH-PROD",
        "address": "Building C, Industrial Zone",
        "is_primary": False,
    },
]

LOCATIONS = [
    {"name": "Rack A", "code": "RACK-A", "warehouse_key": "Main Warehouse"},
    {"name": "Rack B", "code": "RACK-B", "warehouse_key": "Main Warehouse"},
    {"name": "Rack C", "code": "RACK-C", "warehouse_key": "Main Warehouse"},
    {"name": "Rack D", "code": "RACK-D", "warehouse_key": "Secondary Warehouse"},
    {"name": "Assembly Line 1", "code": "LINE-1", "warehouse_key": "Production Floor"},
]

PRODUCTS = [
    {
        "name": "Office Chair",
        "sku": "CHAIR-001",
        "category_name": "Furniture",
        "unit_of_measure": "units",
        "reorder_threshold": 20,
    },
    {
        "name": "Steel Rod",
        "sku": "STEEL-001",
        "category_name": "Raw Materials",
        "unit_of_measure": "kg",
        "reorder_threshold": 50,
    },
    {
        "name": "Laptop",
        "sku": "LAPTOP-001",
        "category_name": "Electronics",
        "unit_of_measure": "units",
        "reorder_threshold": 15,
    },
    {
        "name": "Wooden Table",
        "sku": "TABLE-001",
        "category_name": "Furniture",
        "unit_of_measure": "units",
        "reorder_threshold": 10,
    },
    {
        "name": "Keyboard",
        "sku": "KB-001",
        "category_name": "Electronics",
        "unit_of_measure": "units",
        "reorder_threshold": 25,
    },
    {
        "name": "Monitor",
        "sku": "MON-001",
        "category_name": "Electronics",
        "unit_of_measure": "units",
        "reorder_threshold": 20,
    },
]


def try_request(method, paths, json_data=None, headers=None):
    """Try multiple API paths with fallback (handling 404s and connection errors)."""
    for path in paths:
        url = f"{BASE_URL}{path}"
        try:
            if method.upper() == "POST":
                res = requests.post(url, json=json_data, headers=headers, timeout=5)
            elif method.upper() == "GET":
                res = requests.get(url, headers=headers, timeout=5)
            else:
                continue
            
            if res.status_code == 404:
                print(f"⚠️ Endpoint {path} returned 404 Not Found, trying next...")
                continue
            
            return res
        except requests.exceptions.ConnectionError:
            print(f"⚠️ Connection error for {url}. Is the backend running?")
            return None
        except Exception as e:
            print(f"⚠️ Error calling {url}: {e}")
            continue
    return None


def main():
    print("🚀 Starting Invento Backend Seeder...")

    # 1. Authenticate (optional, for endpoints requiring auth)
    headers = {}
    print("🔑 Attempting authentication for seeded requests...")
    try:
        signup_paths = ["/api/v1/auth/signup", "/auth/signup", "/api/auth/signup"]
        for p in signup_paths:
            try:
                requests.post(
                    f"{BASE_URL}{p}",
                    json={
                        "email": "admin@invento.com",
                        "name": "Admin Seeder",
                        "password": "password123",
                        "role": "ADMIN"
                    },
                    timeout=3
                )
            except Exception:
                pass

        login_paths = ["/api/v1/auth/login", "/auth/login", "/api/auth/login"]
        for p in login_paths:
            res = requests.post(
                f"{BASE_URL}{p}",
                data={"username": "admin@invento.com", "password": "password123"},
                timeout=3
            )
            if res.status_code == 200:
                token = res.json().get("access_token")
                if token:
                    headers = {"Authorization": f"Bearer {token}"}
                    print("✅ Successfully authenticated as admin@invento.com")
                    break
    except Exception as e:
        print(f"⚠️ Authentication attempt skipped or failed: {e}")

    # 2. Seed Warehouses
    warehouse_paths = ["/warehouses", "/api/warehouses", "/api/v1/warehouses"]
    warehouse_ids = {}
    print("\n📦 Seeding Warehouses...")
    for wh in WAREHOUSES:
        try:
            res = try_request("POST", warehouse_paths, json_data=wh, headers=headers)
            if res and res.status_code in [200, 201]:
                data = res.json()
                wh_id = data.get("id")
                warehouse_ids[wh["name"]] = wh_id
                print(f"  ✅ Created Warehouse: {wh['name']} (ID: {wh_id})")
            else:
                status_code = res.status_code if res else "N/A"
                text_err = res.text if res else "No response"
                print(f"  ❌ Failed to create warehouse {wh['name']} (Status: {status_code}): {text_err}")
        except Exception as e:
            print(f"  ❌ Exception creating warehouse {wh['name']}: {e}")

    # 3. Seed Categories (needed for products)
    category_paths = ["/categories", "/api/categories", "/api/v1/categories", "/api/v1/categories/"]
    category_ids = {}
    unique_categories = set(p["category_name"] for p in PRODUCTS)
    print("\n🏷️ Seeding Categories...")
    for cat_name in unique_categories:
        try:
            res = try_request("POST", category_paths, json_data={"name": cat_name}, headers=headers)
            if res and res.status_code in [200, 201]:
                data = res.json()
                cat_id = data.get("id")
                category_ids[cat_name] = cat_id
                print(f"  ✅ Created Category: {cat_name} (ID: {cat_id})")
            else:
                get_res = try_request("GET", category_paths, headers=headers)
                if get_res and get_res.status_code == 200:
                    for cat in get_res.json():
                        if cat.get("name") == cat_name:
                            category_ids[cat_name] = cat.get("id")
                            print(f"  ℹ️ Found existing Category: {cat_name} (ID: {cat.get('id')})")
                            break
        except Exception as e:
            print(f"  ❌ Exception creating category {cat_name}: {e}")

    # 4. Seed Products
    product_paths = ["/products", "/api/products", "/api/v1/products", "/api/v1/products/"]
    product_ids = {}
    print("\n🛍️ Seeding Products...")
    for prod in PRODUCTS:
        try:
            prod_payload = {
                "name": prod["name"],
                "sku": prod["sku"],
                "unit_of_measure": prod["unit_of_measure"],
                "reorder_threshold": prod["reorder_threshold"],
            }
            if prod["category_name"] in category_ids:
                prod_payload["category_id"] = category_ids[prod["category_name"]]

            res = try_request("POST", product_paths, json_data=prod_payload, headers=headers)
            if res and res.status_code in [200, 201]:
                data = res.json()
                prod_id = data.get("id")
                product_ids[prod["sku"]] = prod_id
                print(f"  ✅ Created Product: {prod['name']} ({prod['sku']})")
            else:
                status_code = res.status_code if res else "N/A"
                text_err = res.text if res else "No response"
                print(f"  ❌ Failed to create product {prod['name']} (Status: {status_code}): {text_err}")
        except Exception as e:
            print(f"  ❌ Exception creating product {prod['name']}: {e}")

    # 5. Seed Locations
    location_paths = ["/locations", "/api/locations", "/api/v1/locations", "/api/v1/locations/"]
    print("\n📍 Seeding Locations...")
    for loc in LOCATIONS:
        try:
            wh_key = loc["warehouse_key"]
            wh_id = warehouse_ids.get(wh_key)
            loc_payload = {
                "name": loc["name"],
                "code": loc["code"],
            }
            if wh_id:
                loc_payload["warehouse_id"] = wh_id

            res = try_request("POST", location_paths, json_data=loc_payload, headers=headers)
            if res and res.status_code in [200, 201]:
                data = res.json()
                print(f"  ✅ Created Location: {loc['name']} under {wh_key}")
            else:
                status_code = res.status_code if res else "N/A"
                text_err = res.text if res else "No response"
                print(f"  ❌ Failed to create location {loc['name']} (Status: {status_code}): {text_err}")
        except Exception as e:
            print(f"  ❌ Exception creating location {loc['name']}: {e}")

    print("\n✨ Seeding process completed successfully!")


if __name__ == "__main__":
    main()
