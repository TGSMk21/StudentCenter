"""
scripts/seed.py
Run with: python manage.py runscript seed
Seeds the database with Mulungushi University campus vendors and sample products.
"""

import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils.text import slugify
from apps.users.models import User
from apps.vendors.models import Vendor
from apps.products.models import Product, Category


def run():
    print("🌱  Seeding Student Center Hub database...")

    # ── Admin ──────────────────────────────────────────────
    admin, _ = User.objects.get_or_create(
        email="admin@mu.ac.zm",
        defaults={"name": "SCH Administrator", "role": User.Role.ADMIN, "is_staff": True, "is_superuser": True},
    )
    admin.set_password("Admin@2024!")
    admin.save()
    print("  ✓ Admin user created: admin@mu.ac.zm / Admin@2024!")

    # ── Categories ─────────────────────────────────────────
    cats = [
        ("Groceries", "groceries", "shopping_basket"),
        ("Food & Beverages", "food-beverages", "fastfood"),
        ("Hair & Beauty", "hair-beauty", "content_cut"),
        ("Stationery", "stationery", "edit"),
        ("Tech & Gadgets", "tech-gadgets", "devices"),
        ("Pharmacy", "pharmacy", "local_pharmacy"),
        ("Meat & Butchery", "meat-butchery", "set_meal"),
        ("Printing Services", "printing", "print"),
    ]
    cat_map = {}
    for name, slug, icon in cats:
        c, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name, "icon": icon})
        cat_map[slug] = c
    print(f"  ✓ {len(cats)} categories created")

    # ── Vendors ────────────────────────────────────────────
    vendors_data = [
        {
            "name": "Twice Unimart",
            "category": Vendor.Category.MINIMART,
            "description": "Your one-stop campus minimart. Groceries, toiletries, beverages, snacks and more.",
            "location_notes": "Block A, Ground Floor, Student Centre",
            "has_bookable_services": False,
        },
        {
            "name": "Mulwanda's Salon",
            "category": Vendor.Category.SALON,
            "description": "Professional hair care services. Washing, braiding, blow drying, eyebrow shaping.",
            "location_notes": "Block B, Room 4, Student Centre",
            "has_bookable_services": True,
        },
        {
            "name": "Write General Dealers",
            "category": Vendor.Category.GENERAL_DEALERS,
            "description": "Printing, laminating, binding, scanning, stationery and electrical supplies.",
            "location_notes": "Block A, Room 2, Student Centre",
            "has_bookable_services": True,
        },
        {
            "name": "Hamted Investments",
            "category": Vendor.Category.TECH_STORE,
            "description": "Software installations, device repairs, gadgets and tech accessories.",
            "location_notes": "Block C, Room 1, Student Centre",
            "has_bookable_services": True,
        },
        {
            "name": "Campus Pharmacy",
            "category": Vendor.Category.PHARMACY,
            "description": "Medication, cosmetics, disease testing and medical consultations.",
            "location_notes": "Block D, Ground Floor, Student Centre",
            "has_bookable_services": True,
        },
        {
            "name": "Shell's Butchery",
            "category": Vendor.Category.BUTCHERY,
            "description": "Fresh sausage, chicken, pork and ice cream.",
            "location_notes": "Block A, Room 6, Student Centre",
            "has_bookable_services": False,
        },
        {
            "name": "Tony's Fast Food",
            "category": Vendor.Category.FAST_FOOD,
            "description": "Shawarmas, fries, fried chicken, sausage, pork and burgers.",
            "location_notes": "Block E, Ground Floor, Student Centre",
            "has_bookable_services": False,
        },
    ]

    vendor_map = {}
    for vd in vendors_data:
        v, _ = Vendor.objects.get_or_create(
            slug=slugify(vd["name"]),
            defaults={**vd, "status": Vendor.Status.ACTIVE, "operating_days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},
        )
        vendor_map[v.name] = v
    print(f"  ✓ {len(vendors_data)} vendors seeded")

    # ── Sample Products ────────────────────────────────────
    products = [
        # Twice Unimart
        {"vendor": "Twice Unimart", "name": "Mineral Water 500ml", "price": "5.00", "stock": 200, "category": "food-beverages"},
        {"vendor": "Twice Unimart", "name": "Bread Loaf", "price": "25.00", "stock": 50, "category": "groceries"},
        {"vendor": "Twice Unimart", "name": "Coca-Cola 500ml", "price": "12.00", "stock": 150, "category": "food-beverages"},
        {"vendor": "Twice Unimart", "name": "Sunlight Dish Soap 500g", "price": "28.00", "stock": 80, "category": "groceries"},
        # Tony's Fast Food
        {"vendor": "Tony's Fast Food", "name": "Shawarma (Chicken)", "price": "65.00", "stock": 100, "category": "food-beverages"},
        {"vendor": "Tony's Fast Food", "name": "Chips (Large)", "price": "30.00", "stock": 100, "category": "food-beverages"},
        {"vendor": "Tony's Fast Food", "name": "Burger (Beef)", "price": "75.00", "stock": 60, "category": "food-beverages"},
        # Shell's Butchery
        {"vendor": "Shell's Butchery", "name": "Chicken (Half)", "price": "95.00", "stock": 30, "category": "meat-butchery"},
        {"vendor": "Shell's Butchery", "name": "Sausage (500g)", "price": "55.00", "stock": 50, "category": "meat-butchery"},
        # Mulwanda's Salon — services
        {"vendor": "Mulwanda's Salon", "name": "Hair Washing & Blow Dry", "price": "80.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        {"vendor": "Mulwanda's Salon", "name": "Braiding (Box Braids)", "price": "250.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        {"vendor": "Mulwanda's Salon", "name": "Eyebrow Shaping", "price": "30.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        # Write General Dealers
        {"vendor": "Write General Dealers", "name": "A4 Paper Ream (500 sheets)", "price": "85.00", "stock": 30, "category": "stationery"},
        {"vendor": "Write General Dealers", "name": "Printing (B&W, per page)", "price": "2.00", "stock": 9999, "is_service": True, "category": "printing"},
        {"vendor": "Write General Dealers", "name": "Laminating (A4)", "price": "10.00", "stock": 9999, "is_service": True, "category": "printing"},
        # Hamted Tech
        {"vendor": "Hamted Investments", "name": "Phone Screen Protector", "price": "45.00", "stock": 100, "category": "tech-gadgets"},
        {"vendor": "Hamted Investments", "name": "Phone Repair (Screen)", "price": "350.00", "stock": 999, "is_service": True, "category": "tech-gadgets"},
        {"vendor": "Hamted Investments", "name": "Software Installation", "price": "100.00", "stock": 999, "is_service": True, "category": "tech-gadgets"},
        # Pharmacy
        {"vendor": "Campus Pharmacy", "name": "Paracetamol (20 tabs)", "price": "18.00", "stock": 200, "category": "pharmacy"},
        {"vendor": "Campus Pharmacy", "name": "Medical Consultation", "price": "50.00", "stock": 999, "is_service": True, "category": "pharmacy"},
    ]

    created = 0
    for p in products:
        vendor = vendor_map.get(p["vendor"])
        if not vendor:
            continue
        cat = cat_map.get(p.get("category", ""))
        Product.objects.get_or_create(
            vendor=vendor,
            name=p["name"],
            defaults={
                "price": p["price"],
                "stock": p["stock"],
                "is_service": p.get("is_service", False),
                "is_available": True,
                "category": cat,
            },
        )
        created += 1
    print(f"  ✓ {created} products seeded")

    print("\n🎉  Seeding complete!")
    print("   Admin login: admin@mu.ac.zm / Admin@2024!")
    print("   API Docs:    http://localhost:8000/api/v1/docs/")
