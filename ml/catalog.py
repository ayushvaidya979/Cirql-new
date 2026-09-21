"""Device catalogue: dataset folder -> clean display name + pricing brand.

`brand_id` must match a brand id in src/data/pricing.js so a detected device
can pre-fill the valuation flow.
"""

BRANDS = {
    # dataset brand folder: (category, brand_id, brand display name)
    "Iphone": ("phone", "apple", "Apple"),
    "Oneplus": ("phone", "oneplus", "OnePlus"),
    "Redmi": ("phone", "xiaomi", "Xiaomi"),
    "Samsung": ("phone", "samsung", "Samsung"),
    "VIVO": ("phone", "vivo", "Vivo"),
    "HP": ("laptop", "hp", "HP"),
    "Lenovo": ("laptop", "lenovo", "Lenovo"),
    "dell": ("laptop", "dell", "Dell"),
}

MODEL_NAMES = {
    # HP
    "EliteBook_1040_G3": "HP EliteBook 1040 G3",
    "EliteBook_8440p": "HP EliteBook 8440p",
    "Envy_14": "HP Envy 14",
    "Omen_15": "HP Omen 15",
    "Omen_16": "HP Omen 16",
    "Pavilion_dv6000": "HP Pavilion dv6000",
    "Spectre_x360_13": "HP Spectre x360 13",
    "Spectre_x360_14": "HP Spectre x360 14",
    # Lenovo
    "IdeaPad_320": "Lenovo IdeaPad 320",
    "IdeaPad_Yoga_2_Pro": "Lenovo IdeaPad Yoga 2 Pro",
    "Legion_Pro_7": "Lenovo Legion Pro 7",
    "Legion_Y740": "Lenovo Legion Y740",
    "ThinkPad_T400": "Lenovo ThinkPad T400",
    "ThinkPad_T440s": "Lenovo ThinkPad T440s",
    "ThinkPad_T480": "Lenovo ThinkPad T480",
    "ThinkPad_X1_Carbon_Gen_3": "Lenovo ThinkPad X1 Carbon Gen 3",
    "ThinkPad_X1_Carbon_Gen_9": "Lenovo ThinkPad X1 Carbon Gen 9",
    "ThinkPad_X220": "Lenovo ThinkPad X220",
    # Dell
    "XPS13(9310)": "Dell XPS 13 (9310)",
    "XPS13(9345)": "Dell XPS 13 (9345)",
    "XPS13(9370)": "Dell XPS 13 (9370)",
    "XPS15(9520)": "Dell XPS 15 (9520)",
    "XPS15(9560)": "Dell XPS 15 (9560)",
    "XPS15(L502X)": "Dell XPS 15 (L502X)",
    "inspiron1525": "Dell Inspiron 1525",
    "latitude7400": "Dell Latitude 7400",
    "latitudeE6410": "Dell Latitude E6410",
    # Apple
    "iPhone 12": "iPhone 12",
    "iPhone 13": "iPhone 13",
    "iPhone 13 Pro Max": "iPhone 13 Pro Max",
    "iPhone 14": "iPhone 14",
    "iPhone 14 Pro": "iPhone 14 Pro",
    "iPhone 14 Pro Max": "iPhone 14 Pro Max",
    "iPhone 15 Pro": "iPhone 15 Pro",
    "iPhone 15 Pro Max": "iPhone 15 Pro Max",
    "iPhone SE (3rd generation)": "iPhone SE (3rd gen)",
    "iphone 15": "iPhone 15",
    # OnePlus
    "oneplus 12": "OnePlus 12",
    "oneplus 12R": "OnePlus 12R",
    "oneplus 13": "OnePlus 13",
    "oneplus 13R": "OnePlus 13R",
    "oneplus nord 3 5g": "OnePlus Nord 3 5G",
    "oneplus nord 4": "OnePlus Nord 4",
    "oneplus nord 5": "OnePlus Nord 5",
    "oneplus nord ce5": "OnePlus Nord CE5",
    # Redmi (Xiaomi)
    "redmi1": "Redmi 1",
    "redmi10": "Redmi 10",
    "redmi4prime": "Redmi 4 Prime",
    "redmi5": "Redmi 5",
    "redmi6": "Redmi 6",
    "redmi8a": "Redmi 8A",
    "redmi9pro": "Redmi 9 Pro",
    "redminote11": "Redmi Note 11",
    "redminote15": "Redmi Note 15",
    "redminote5": "Redmi Note 5",
    "redminote7": "Redmi Note 7",
    # Samsung
    "Galaxy S23": "Samsung Galaxy S23",
    "Galaxy S24 Ultra": "Samsung Galaxy S24 Ultra",
    "Samsung Galaxy A34 5G": "Samsung Galaxy A34 5G",
    "Samsung Galaxy A52": "Samsung Galaxy A52",
    "Samsung Galaxy A54 5G": "Samsung Galaxy A54 5G",
    "Samsung Galaxy F23 5G": "Samsung Galaxy F23 5G",
    "Samsung Galaxy M14 5G": "Samsung Galaxy M14 5G",
    "Samsung Galaxy M31": "Samsung Galaxy M31",
    "Samsung Galaxy Note 20 Ultra": "Samsung Galaxy Note 20 Ultra",
    "Samsung Galaxy S21": "Samsung Galaxy S21",
    # Vivo
    "Vivo V19": "Vivo V19",
    "Vivo V25": "Vivo V25",
    "Vivo V30": "Vivo V30",
    "Vivo X1": "Vivo X1",
    "Vivo X300": "Vivo X300",
    "Vivo X60": "Vivo X60",
    "Vivo Y17 5g": "Vivo Y17 5G",
    "Vivo Y21": "Vivo Y21",
    "Vivo Y21t": "Vivo Y21T",
    "Vvivo X 100": "Vivo X100",
}


def build(root):
    """Return the ordered class list for a dataset root (category/brand/model/*.jpg)."""
    import os

    classes = []
    for cat_dir in sorted(os.listdir(root)):
        cat_path = os.path.join(root, cat_dir)
        if not os.path.isdir(cat_path):
            continue
        for brand_dir in sorted(os.listdir(cat_path)):
            brand_path = os.path.join(cat_path, brand_dir)
            if not os.path.isdir(brand_path):
                continue
            category, brand_id, brand_name = BRANDS[brand_dir]
            for model_dir in sorted(os.listdir(brand_path)):
                if not os.path.isdir(os.path.join(brand_path, model_dir)):
                    continue
                classes.append({
                    "id": len(classes),
                    "folder": f"{cat_dir}/{brand_dir}/{model_dir}",
                    "category": category,
                    "brand_id": brand_id,
                    "brand": brand_name,
                    "model": MODEL_NAMES[model_dir],
                })
    return classes
