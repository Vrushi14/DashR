import os

replacements = [
    ("DashRx", "PharmaDash"),
    ("dashrx", "pharmadash"),
    ("gstin", "odsCode"),
    ("GSTIN", "ODS Code"),
    ("GST Slab", "VAT Slab"),
    ("GST", "FP34"),
    ("GSTR-2B", "NHSBSA"),
    ("₹", "£"),
    ("Drug License No", "NHS Contract No"),
    ("Drug License", "NHS Contract"),
    ("Stockist Recon", "Statement Recon"),
    ("Stockist", "Supplier"),
    ("stockist", "supplier"),
    ("Pin-code Demand", "Dispensing Data"),
    ("Pin-code", "National"),
    ("Pincode", "National"),
    ("Peer Benchmark", "Pharmacy Comparison"),
    ("DPDP", "GDPR"),
    ("India", "UK"),
    ("Indian", "UK"),
    ("27AAAAA1111A1Z1", "FLF77"),
    ("DL-2026/MH-MUM", "NHS-2026-UK"),
    ("Krishna Medicos, Mumbai", "Smiths Pharmacy, London"),
    ("Keimed Mumbai", "Alliance Healthcare"),
    ("PharmEasy B2B Portal", "AAH Pharmaceuticals"),
    ("Ascent Wellness", "Phoenix Medical"),
    ("Apollo B2B Portal", "Sigma Pharmaceuticals"),
    ("Rupee", "Pound"),
    ("Mumbai", "London"),
    ("Delhi", "Manchester"),
    ("Hyderabad", "Birmingham"),
    ("Pune", "Leeds")
]

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for search, replace in replacements:
        content = content.replace(search, replace)
        
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {os.path.basename(file_path)}")

def scan_directory(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        if 'dist' in dirs:
            dirs.remove('dist')
            
        for file in files:
            if file == "Home.jsx" or file.endswith(".py") or file.endswith(".ps1") or file.endswith(".js"):
                continue
            if file.endswith(".jsx") or file.endswith(".md") or file.endswith(".cjs"):
                file_path = os.path.join(root, file)
                process_file(file_path)

scan_directory(r"c:\Users\HP\DashRx")
print("Conversion complete.")
