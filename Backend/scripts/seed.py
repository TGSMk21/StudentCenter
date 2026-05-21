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
    print("[Seeder] Seeding Student Center Hub database...")

    PASSWORD = "password123"

    # ── Admin ──────────────────────────────────────────────
    admin, _ = User.objects.get_or_create(
        email="admin@mu.ac.zm",
        defaults={"name": "SCH Administrator", "role": User.Role.ADMIN, "is_staff": True, "is_superuser": True},
    )
    admin.set_password("Admin@2024!")
    admin.save()
    print("  [OK] Admin: admin@mu.ac.zm / Admin@2024!")

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
    print(f"  [OK] {len(cats)} categories created")

    # ── Vendors ────────────────────────────────────────────
    vendors_data = [
        {
            "email": "twice@shop.com",
            "name": "Twice Unimart",
            "owner_name": "Mwila Banda",
            "category": Vendor.Category.MINIMART,
            "description": "Your one-stop campus minimart. Groceries, toiletries, beverages, snacks and more.",
            "location_notes": "Block A, Ground Floor, Student Centre",
            "has_bookable_services": False,
            "opening_time": "07:00",
            "closing_time": "18:00",
        },
        {
            "email": "mulwanda@shop.com",
            "name": "Mulwanda's Salon",
            "owner_name": "Chilufya Mulwanda",
            "category": Vendor.Category.SALON,
            "description": "Professional hair care services. Washing, braiding, blow drying, eyebrow shaping.",
            "location_notes": "Block B, Room 4, Student Centre",
            "has_bookable_services": True,
            "opening_time": "08:00",
            "closing_time": "17:00",
        },
        {
            "email": "write@shop.com",
            "name": "Write General Dealers",
            "owner_name": "Kelvin Banda",
            "category": Vendor.Category.GENERAL_DEALERS,
            "description": "Printing, laminating, binding, scanning, stationery and electrical supplies.",
            "location_notes": "Block A, Room 2, Student Centre",
            "has_bookable_services": True,
            "opening_time": "08:00",
            "closing_time": "17:00",
        },
        {
            "email": "hamted@shop.com",
            "name": "Hamted Investments",
            "owner_name": "Themba Mkandawire",
            "category": Vendor.Category.TECH_STORE,
            "description": "Software installations, device repairs, gadgets and tech accessories.",
            "location_notes": "Block C, Room 1, Student Centre",
            "has_bookable_services": True,
            "opening_time": "09:00",
            "closing_time": "17:00",
        },
        {
            "email": "pharmacy@shop.com",
            "name": "Campus Pharmacy",
            "owner_name": "Dr. Nancy Zulu",
            "category": Vendor.Category.PHARMACY,
            "description": "Medication, cosmetics, disease testing and medical consultations.",
            "location_notes": "Block D, Ground Floor, Student Centre",
            "has_bookable_services": True,
            "opening_time": "08:00",
            "closing_time": "18:00",
        },
        {
            "email": "shells@shop.com",
            "name": "Shell's Butchery",
            "owner_name": "Agness Shell",
            "category": Vendor.Category.BUTCHERY,
            "description": "Fresh sausage, chicken, pork and ice cream.",
            "location_notes": "Block A, Room 6, Student Centre",
            "has_bookable_services": False,
            "opening_time": "07:00",
            "closing_time": "17:00",
        },
        {
            "email": "tonys@shop.com",
            "name": "Tony's Fast Food",
            "owner_name": "Tony Phiri",
            "category": Vendor.Category.FAST_FOOD,
            "description": "Shawarmas, fries, fried chicken, sausage, pork and burgers.",
            "location_notes": "Block E, Ground Floor, Student Centre",
            "has_bookable_services": False,
            "opening_time": "09:00",
            "closing_time": "21:00",
        },
    ]

    vendor_map = {}
    for vd in vendors_data:
        # Create vendor user
        owner, _ = User.objects.get_or_create(
            email=vd["email"],
            defaults={
                "name": vd["owner_name"],
                "role": User.Role.VENDOR,
            },
        )
        owner.set_password(PASSWORD)
        owner.save()

        # Create vendor profile
        v, _ = Vendor.objects.get_or_create(
            slug=slugify(vd["name"]),
            defaults={
                "owner": owner,
                "name": vd["name"],
                "category": vd["category"],
                "description": vd["description"],
                "location_notes": vd["location_notes"],
                "has_bookable_services": vd["has_bookable_services"],
                "status": Vendor.Status.ACTIVE,
                "operating_days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            },
        )
        vendor_map[v.name] = v

        print(f"  [OK] Vendor: {vd['name']} ({vd['email']} / {PASSWORD})")

    # ── Student ─────────────────────────────────────────────
    student, _ = User.objects.get_or_create(
        email="student@mu.ac.zm",
        defaults={
            "name": "Daniel Mwale",
            "role": User.Role.STUDENT,
            "student_id": "MU/2024/001",
            "program": "Computer Science",
            "year_of_study": 3,
        },
    )
    student.set_password(PASSWORD)
    student.save()
    print(f"  [OK] Student: student@mu.ac.zm / {PASSWORD}")

    # ── Sample Products ────────────────────────────────────
    products = [
        # Twice Unimart
        {"vendor": "Twice Unimart", "name": "Mineral Water 500ml", "price": "5.00", "stock": 200, "category": "food-beverages"},
        {"vendor": "Twice Unimart", "name": "Bread Loaf", "price": "25.00", "stock": 50, "category": "groceries"},
        {"vendor": "Twice Unimart", "name": "Coca-Cola 500ml", "price": "12.00", "stock": 150, "category": "food-beverages"},
        {"vendor": "Twice Unimart", "name": "Sunlight Dish Soap 500g", "price": "28.00", "stock": 80, "category": "groceries"},
        {"vendor": "Twice Unimart", "name": "Fanta Orange 500ml", "price": "12.00", "stock": 120, "category": "food-beverages"},
        {"vendor": "Twice Unimart", "name": "Milk Fresh 1L", "price": "32.00", "stock": 40, "category": "groceries"},
        # Tony's Fast Food
        {"vendor": "Tony's Fast Food", "name": "Shawarma (Chicken)", "price": "65.00", "stock": 100, "category": "food-beverages"},
        {"vendor": "Tony's Fast Food", "name": "Chips (Large)", "price": "30.00", "stock": 100, "category": "food-beverages"},
        {"vendor": "Tony's Fast Food", "name": "Burger (Beef)", "price": "75.00", "stock": 60, "category": "food-beverages"},
        {"vendor": "Tony's Fast Food", "name": "Fried Chicken (4 pcs)", "price": "55.00", "stock": 50, "category": "food-beverages"},
        {"vendor": "Tony's Fast Food", "name": "Sausage Roll", "price": "20.00", "stock": 80, "category": "food-beverages"},
        # Shell's Butchery
        {"vendor": "Shell's Butchery", "name": "Chicken (Half)", "price": "95.00", "stock": 30, "category": "meat-butchery"},
        {"vendor": "Shell's Butchery", "name": "Sausage (500g)", "price": "55.00", "stock": 50, "category": "meat-butchery"},
        {"vendor": "Shell's Butchery", "name": "Pork Chops (1kg)", "price": "120.00", "stock": 25, "category": "meat-butchery"},
        {"vendor": "Shell's Butchery", "name": "Ice Cream Tub 2L", "price": "65.00", "stock": 20, "category": "food-beverages"},
        # Mulwanda's Salon
        {"vendor": "Mulwanda's Salon", "name": "Hair Washing & Blow Dry", "price": "80.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        {"vendor": "Mulwanda's Salon", "name": "Braiding (Box Braids)", "price": "250.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        {"vendor": "Mulwanda's Salon", "name": "Eyebrow Shaping", "price": "30.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        {"vendor": "Mulwanda's Salon", "name": "Haircut (Men)", "price": "40.00", "stock": 999, "is_service": True, "category": "hair-beauty"},
        # Write General Dealers
        {"vendor": "Write General Dealers", "name": "A4 Paper Ream (500 sheets)", "price": "85.00", "stock": 30, "category": "stationery"},
        {"vendor": "Write General Dealers", "name": "Printing (B&W, per page)", "price": "2.00", "stock": 9999, "is_service": True, "category": "printing"},
        {"vendor": "Write General Dealers", "name": "Laminating (A4)", "price": "10.00", "stock": 9999, "is_service": True, "category": "printing"},
        {"vendor": "Write General Dealers", "name": "Binding (per book)", "price": "25.00", "stock": 9999, "is_service": True, "category": "printing"},
        # Hamted Investments
        {"vendor": "Hamted Investments", "name": "Phone Screen Protector", "price": "45.00", "stock": 100, "category": "tech-gadgets"},
        {"vendor": "Hamted Investments", "name": "Phone Repair (Screen)", "price": "350.00", "stock": 999, "is_service": True, "category": "tech-gadgets"},
        {"vendor": "Hamted Investments", "name": "Software Installation", "price": "100.00", "stock": 999, "is_service": True, "category": "tech-gadgets"},
        {"vendor": "Hamted Investments", "name": "USB-C Cable 2m", "price": "55.00", "stock": 50, "category": "tech-gadgets"},
        # Campus Pharmacy
        {"vendor": "Campus Pharmacy", "name": "Paracetamol (20 tabs)", "price": "18.00", "stock": 200, "category": "pharmacy"},
        {"vendor": "Campus Pharmacy", "name": "Medical Consultation", "price": "50.00", "stock": 999, "is_service": True, "category": "pharmacy"},
        {"vendor": "Campus Pharmacy", "name": "Cough Syrup 100ml", "price": "35.00", "stock": 60, "category": "pharmacy"},
        {"vendor": "Campus Pharmacy", "name": "First Aid Kit", "price": "120.00", "stock": 25, "category": "pharmacy"},
    ]

    created = 0
    for p in products:
        vendor = vendor_map.get(p["vendor"])
        if not vendor:
            continue
        cat = cat_map.get(p.get("category", ""))
        _, was_created = Product.objects.get_or_create(
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
        if was_created:
            created += 1
    print(f"  [OK] {created} products seeded ({len(products) - created} already existed)")

    print("\n***  Seeding complete!")
    print("   -------------------------------------")
    print(f"   Admin:    admin@mu.ac.zm / Admin@2024!")
    print(f"   Student:  student@mu.ac.zm / {PASSWORD}")
    for vd in vendors_data:
        print(f"   Vendor:   {vd['email']} / {PASSWORD}  ({vd['name']})")
    print("   -------------------------------------")
    print("   API Docs: http://localhost:8000/api/v1/docs/")
