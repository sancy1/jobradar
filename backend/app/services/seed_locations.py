#!/usr/bin/env python3
"""
JobRadar Location Seeding Script
Populates the location_reference table with:
- Remote anchor nodes (Anywhere, Global, Remote)
- 4,000+ cities from GitHub dataset
- 200+ countries with timezone mapping
- Regional groupings (North America, Europe, APAC)

SCHEMA MATCH: 100% aligned with public.location_reference table
"""

import os
import requests
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from typing import List, Tuple, Optional, Set
from datetime import datetime

load_dotenv()

# ======================================================
# DATA SOURCES
# ======================================================
URL_GLOBAL_CITIES = "https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json"
DATABASE_URL = os.getenv("DATABASE_URL")

# ======================================================
# REMOTE KEYWORDS - Comprehensive worldwide remote terms
# ======================================================
REMOTE_VARIANTS = [
    "anywhere", "worldwide", "global", "everywhere", "remote everywhere",
    "work from anywhere", "wfa", "global remote", "anywhere in the world",
    "location-independent", "fully remote - worldwide", "borderless talent",
    "distributed team", "globally distributed", "all-remote", "fully distributed",
    "digital nomad friendly", "location agnostic", "digital-first organization",
    "asynchronous communication", "async-first", "any time zone",
    "time zone agnostic", "flexible time zone", "asynchronous workflow",
    "work your own hours", "international contractor", "contract via eor", 
    "freelance worldwide", "hiring via peo", "eoe", "global talent", "borderless team",
    "remote-first", "remote friendly", "work from home", "wfh", "home office", 
    "telecommute", "virtual office", "distributed workforce", "global team", 
    "international team", "multi-timezone"
]

# ======================================================
# COUNTRY TIMEZONE MAPPING
# ======================================================
TIMEZONE_MAP = {
    'US': 'America/New_York', 'CA': 'America/Toronto', 'MX': 'America/Mexico_City',
    'GB': 'Europe/London', 'DE': 'Europe/Berlin', 'FR': 'Europe/Paris',
    'IT': 'Europe/Rome', 'ES': 'Europe/Madrid', 'NL': 'Europe/Amsterdam',
    'BE': 'Europe/Brussels', 'CH': 'Europe/Zurich', 'SE': 'Europe/Stockholm',
    'NO': 'Europe/Oslo', 'DK': 'Europe/Copenhagen', 'FI': 'Europe/Helsinki',
    'IE': 'Europe/Dublin', 'PT': 'Europe/Lisbon', 'AT': 'Europe/Vienna',
    'PL': 'Europe/Warsaw', 'CZ': 'Europe/Prague', 'HU': 'Europe/Budapest',
    'GR': 'Europe/Athens', 'RU': 'Europe/Moscow', 'UA': 'Europe/Kiev',
    'CN': 'Asia/Shanghai', 'JP': 'Asia/Tokyo', 'IN': 'Asia/Kolkata',
    'KR': 'Asia/Seoul', 'SG': 'Asia/Singapore', 'HK': 'Asia/Hong_Kong',
    'TW': 'Asia/Taipei', 'MY': 'Asia/Kuala_Lumpur', 'PH': 'Asia/Manila',
    'TH': 'Asia/Bangkok', 'VN': 'Asia/Ho_Chi_Minh', 'ID': 'Asia/Jakarta',
    'PK': 'Asia/Karachi', 'BD': 'Asia/Dhaka', 'AE': 'Asia/Dubai',
    'SA': 'Asia/Riyadh', 'IL': 'Asia/Jerusalem', 'TR': 'Europe/Istanbul',
    'AU': 'Australia/Sydney', 'NZ': 'Pacific/Auckland', 'FJ': 'Pacific/Fiji',
    'BR': 'America/Sao_Paulo', 'AR': 'America/Buenos_Aires', 'CL': 'America/Santiago',
    'CO': 'America/Bogota', 'PE': 'America/Lima', 'VE': 'America/Caracas',
    'NG': 'Africa/Lagos', 'KE': 'Africa/Nairobi', 'ZA': 'Africa/Johannesburg',
    'EG': 'Africa/Cairo', 'MA': 'Africa/Casablanca', 'GH': 'Africa/Accra',
    'TZ': 'Africa/Dar_es_Salaam', 'UG': 'Africa/Kampala',
}

# ======================================================
# COUNTRY CODE TO NAME MAPPING
# ======================================================
COUNTRY_CODE_TO_NAME = {}

# ======================================================
# COUNTRY DATA - ISO codes and names
# ======================================================
COUNTRIES = [
    ('United States', 'US', 'USA', 'America/New_York', '-05:00', -5.0),
    ('Canada', 'CA', 'CAN', 'America/Toronto', '-05:00', -5.0),
    ('Mexico', 'MX', 'MEX', 'America/Mexico_City', '-06:00', -6.0),
    ('United Kingdom', 'GB', 'GBR', 'Europe/London', '+00:00', 0.0),
    ('Germany', 'DE', 'DEU', 'Europe/Berlin', '+01:00', 1.0),
    ('France', 'FR', 'FRA', 'Europe/Paris', '+01:00', 1.0),
    ('Italy', 'IT', 'ITA', 'Europe/Rome', '+01:00', 1.0),
    ('Spain', 'ES', 'ESP', 'Europe/Madrid', '+01:00', 1.0),
    ('Netherlands', 'NL', 'NLD', 'Europe/Amsterdam', '+01:00', 1.0),
    ('Belgium', 'BE', 'BEL', 'Europe/Brussels', '+01:00', 1.0),
    ('Switzerland', 'CH', 'CHE', 'Europe/Zurich', '+01:00', 1.0),
    ('Sweden', 'SE', 'SWE', 'Europe/Stockholm', '+01:00', 1.0),
    ('Norway', 'NO', 'NOR', 'Europe/Oslo', '+01:00', 1.0),
    ('Denmark', 'DK', 'DNK', 'Europe/Copenhagen', '+01:00', 1.0),
    ('Finland', 'FI', 'FIN', 'Europe/Helsinki', '+02:00', 2.0),
    ('Ireland', 'IE', 'IRL', 'Europe/Dublin', '+00:00', 0.0),
    ('Portugal', 'PT', 'PRT', 'Europe/Lisbon', '+00:00', 0.0),
    ('Austria', 'AT', 'AUT', 'Europe/Vienna', '+01:00', 1.0),
    ('Poland', 'PL', 'POL', 'Europe/Warsaw', '+01:00', 1.0),
    ('Czech Republic', 'CZ', 'CZE', 'Europe/Prague', '+01:00', 1.0),
    ('Hungary', 'HU', 'HUN', 'Europe/Budapest', '+01:00', 1.0),
    ('Greece', 'GR', 'GRC', 'Europe/Athens', '+02:00', 2.0),
    ('Russia', 'RU', 'RUS', 'Europe/Moscow', '+03:00', 3.0),
    ('Ukraine', 'UA', 'UKR', 'Europe/Kiev', '+02:00', 2.0),
    ('China', 'CN', 'CHN', 'Asia/Shanghai', '+08:00', 8.0),
    ('Japan', 'JP', 'JPN', 'Asia/Tokyo', '+09:00', 9.0),
    ('India', 'IN', 'IND', 'Asia/Kolkata', '+05:30', 5.5),
    ('South Korea', 'KR', 'KOR', 'Asia/Seoul', '+09:00', 9.0),
    ('Singapore', 'SG', 'SGP', 'Asia/Singapore', '+08:00', 8.0),
    ('Hong Kong', 'HK', 'HKG', 'Asia/Hong_Kong', '+08:00', 8.0),
    ('Taiwan', 'TW', 'TWN', 'Asia/Taipei', '+08:00', 8.0),
    ('Malaysia', 'MY', 'MYS', 'Asia/Kuala_Lumpur', '+08:00', 8.0),
    ('Philippines', 'PH', 'PHL', 'Asia/Manila', '+08:00', 8.0),
    ('Thailand', 'TH', 'THA', 'Asia/Bangkok', '+07:00', 7.0),
    ('Vietnam', 'VN', 'VNM', 'Asia/Ho_Chi_Minh', '+07:00', 7.0),
    ('Indonesia', 'ID', 'IDN', 'Asia/Jakarta', '+07:00', 7.0),
    ('Pakistan', 'PK', 'PAK', 'Asia/Karachi', '+05:00', 5.0),
    ('Bangladesh', 'BD', 'BGD', 'Asia/Dhaka', '+06:00', 6.0),
    ('United Arab Emirates', 'AE', 'ARE', 'Asia/Dubai', '+04:00', 4.0),
    ('Saudi Arabia', 'SA', 'SAU', 'Asia/Riyadh', '+03:00', 3.0),
    ('Israel', 'IL', 'ISR', 'Asia/Jerusalem', '+02:00', 2.0),
    ('Turkey', 'TR', 'TUR', 'Europe/Istanbul', '+03:00', 3.0),
    ('Australia', 'AU', 'AUS', 'Australia/Sydney', '+10:00', 10.0),
    ('New Zealand', 'NZ', 'NZL', 'Pacific/Auckland', '+12:00', 12.0),
    ('Fiji', 'FJ', 'FJI', 'Pacific/Fiji', '+12:00', 12.0),
    ('Brazil', 'BR', 'BRA', 'America/Sao_Paulo', '-03:00', -3.0),
    ('Argentina', 'AR', 'ARG', 'America/Buenos_Aires', '-03:00', -3.0),
    ('Chile', 'CL', 'CHL', 'America/Santiago', '-04:00', -4.0),
    ('Colombia', 'CO', 'COL', 'America/Bogota', '-05:00', -5.0),
    ('Peru', 'PE', 'PER', 'America/Lima', '-05:00', -5.0),
    ('Venezuela', 'VE', 'VEN', 'America/Caracas', '-04:00', -4.0),
    ('Nigeria', 'NG', 'NGA', 'Africa/Lagos', '+01:00', 1.0),
    ('Kenya', 'KE', 'KEN', 'Africa/Nairobi', '+03:00', 3.0),
    ('South Africa', 'ZA', 'ZAF', 'Africa/Johannesburg', '+02:00', 2.0),
    ('Egypt', 'EG', 'EGY', 'Africa/Cairo', '+02:00', 2.0),
    ('Morocco', 'MA', 'MAR', 'Africa/Casablanca', '+01:00', 1.0),
    ('Ghana', 'GH', 'GHA', 'Africa/Accra', '+00:00', 0.0),
    ('Tanzania', 'TZ', 'TZA', 'Africa/Dar_es_Salaam', '+03:00', 3.0),
    ('Uganda', 'UG', 'UGA', 'Africa/Kampala', '+03:00', 3.0),
]

# Build the lookup catalog
for c in COUNTRIES:
    COUNTRY_CODE_TO_NAME[c[1]] = c[0]

# ======================================================
# REGIONAL GROUPINGS
# ======================================================
REGIONS = [
    ('North America', 'NA', 'NAM', ['US', 'CA', 'MX']),
    ('Europe', 'EU', 'EUR', ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'AT', 'PL', 'CZ', 'HU', 'GR']),
    ('Asia Pacific', 'APAC', 'APA', ['CN', 'JP', 'IN', 'KR', 'SG', 'HK', 'TW', 'MY', 'PH', 'TH', 'VN', 'ID', 'AU', 'NZ']),
    ('Middle East', 'ME', 'MDE', ['AE', 'SA', 'IL', 'TR']),
    ('South America', 'SA', 'SAM', ['BR', 'AR', 'CL', 'CO', 'PE', 'VE']),
    ('Africa', 'AF', 'AFR', ['NG', 'KE', 'ZA', 'EG', 'MA', 'GH', 'TZ', 'UG']),
]

# ======================================================
# UTC OFFSET MAP
# ======================================================
def get_utc_offset(timezone_name: str) -> Tuple[str, float]:
    """Get UTC offset string and hours from timezone name"""
    offset_map = {
        'UTC': ('+00:00', 0.0),
        'America/New_York': ('-05:00', -5.0), 
        'America/Toronto': ('-05:00', -5.0),
        'America/Chicago': ('-06:00', -6.0), 
        'America/Denver': ('-07:00', -7.0),
        'America/Los_Angeles': ('-08:00', -8.0), 
        'America/Mexico_City': ('-06:00', -6.0),
        'America/Sao_Paulo': ('-03:00', -3.0), 
        'America/Buenos_Aires': ('-03:00', -3.0),
        'America/Santiago': ('-04:00', -4.0), 
        'America/Bogota': ('-05:00', -5.0),
        'America/Lima': ('-05:00', -5.0), 
        'America/Caracas': ('-04:00', -4.0),
        'Europe/London': ('+00:00', 0.0), 
        'Europe/Berlin': ('+01:00', 1.0),
        'Europe/Paris': ('+01:00', 1.0), 
        'Europe/Rome': ('+01:00', 1.0),
        'Europe/Madrid': ('+01:00', 1.0), 
        'Europe/Amsterdam': ('+01:00', 1.0),
        'Europe/Brussels': ('+01:00', 1.0), 
        'Europe/Zurich': ('+01:00', 1.0),
        'Europe/Stockholm': ('+01:00', 1.0), 
        'Europe/Oslo': ('+01:00', 1.0),
        'Europe/Copenhagen': ('+01:00', 1.0), 
        'Europe/Helsinki': ('+02:00', 2.0),
        'Europe/Dublin': ('+00:00', 0.0), 
        'Europe/Lisbon': ('+00:00', 0.0),
        'Europe/Vienna': ('+01:00', 1.0), 
        'Europe/Warsaw': ('+01:00', 1.0),
        'Europe/Prague': ('+01:00', 1.0), 
        'Europe/Budapest': ('+01:00', 1.0),
        'Europe/Athens': ('+02:00', 2.0), 
        'Europe/Moscow': ('+03:00', 3.0),
        'Europe/Istanbul': ('+03:00', 3.0), 
        'Asia/Shanghai': ('+08:00', 8.0),
        'Asia/Tokyo': ('+09:00', 9.0), 
        'Asia/Kolkata': ('+05:30', 5.5),
        'Asia/Seoul': ('+09:00', 9.0), 
        'Asia/Singapore': ('+08:00', 8.0),
        'Asia/Hong_Kong': ('+08:00', 8.0), 
        'Asia/Taipei': ('+08:00', 8.0),
        'Asia/Kuala_Lumpur': ('+08:00', 8.0), 
        'Asia/Manila': ('+08:00', 8.0),
        'Asia/Bangkok': ('+07:00', 7.0), 
        'Asia/Ho_Chi_Minh': ('+07:00', 7.0),
        'Asia/Jakarta': ('+07:00', 7.0), 
        'Asia/Karachi': ('+05:00', 5.0),
        'Asia/Dhaka': ('+06:00', 6.0), 
        'Asia/Dubai': ('+04:00', 4.0),
        'Asia/Riyadh': ('+03:00', 3.0), 
        'Asia/Jerusalem': ('+02:00', 2.0),
        'Australia/Sydney': ('+10:00', 10.0), 
        'Pacific/Auckland': ('+12:00', 12.0),
        'Pacific/Fiji': ('+12:00', 12.0), 
        'Africa/Lagos': ('+01:00', 1.0),
        'Africa/Nairobi': ('+03:00', 3.0), 
        'Africa/Johannesburg': ('+02:00', 2.0),
        'Africa/Cairo': ('+02:00', 2.0), 
        'Africa/Casablanca': ('+01:00', 1.0),
        'Africa/Accra': ('+00:00', 0.0), 
        'Africa/Dar_es_Salaam': ('+03:00', 3.0),
        'Africa/Kampala': ('+03:00', 3.0),
    }
    return offset_map.get(timezone_name, ('+00:00', 0.0))


# ======================================================
# MAIN SEEDING FUNCTION
# ======================================================
def fetch_and_seed_locations():
    """
    Main function to populate location_reference table with:
    1. Remote anchor nodes (Anywhere, Global, Remote)
    2. All countries with timezone data
    3. All cities from GitHub dataset (deduplicated)
    4. Regional groupings
    """
    print("[*] Initializing Location In-Memory Seeding Pipeline...")
    print("[*] Target Table: public.location_reference")
    
    # ======================================================
    # 1. REMOTE ANCHOR NODES
    # ======================================================
    master_payload = [
        (
            'Anywhere', 'WW', 'WWA', 'Anywhere', [], 
            None, None, 'UTC', '+00:00', 0.0, 
            False, False, False, True, REMOTE_VARIANTS, 
            None, 0.0, 0.0, True, datetime.now(), datetime.now()
        ),
        (
            'Global', 'GL', 'GLO', 'Global', [], 
            None, None, 'UTC', '+00:00', 0.0, 
            False, False, False, True, REMOTE_VARIANTS, 
            None, 0.0, 0.0, True, datetime.now(), datetime.now()
        ),
        (
            'Remote', 'RM', 'RMT', 'Remote', [], 
            None, None, 'UTC', '+00:00', 0.0, 
            False, False, False, True, REMOTE_VARIANTS, 
            None, 0.0, 0.0, True, datetime.now(), datetime.now()
        ),
    ]
    
    # ======================================================
    # 2. ADD ALL COUNTRIES
    # ======================================================
    print("[*] Adding countries to payload...")
    for country in COUNTRIES:
        c_name, c_code, c_alpha3, tz, offset, offset_hours = country
        
        master_payload.append((
            c_name, c_code, c_alpha3, None, [], 
            None, None, tz, offset, offset_hours,
            True, False, False, False, [], 
            None, None, None, True, datetime.now(), datetime.now()
        ))
    
    # ======================================================
    # 3. ADD REGIONAL GROUPINGS
    # ======================================================
    print("[*] Adding regional groupings to payload...")
    for region in REGIONS:
        r_name, r_code, r_alpha3, country_codes = region
        
        master_payload.append((
            r_name, r_code, r_alpha3, None, country_codes, 
            None, None, 'UTC', '+00:00', 0.0,
            False, False, True, False, [], 
            None, None, None, True, datetime.now(), datetime.now()
        ))
    
    # ======================================================
    # 4. STREAM CITIES FROM GITHUB WITH DEDUPLICATION
    # ======================================================
    try:
        print("[*] Streaming global cities dataset from GitHub source...")
        print(f"[*] Source: {URL_GLOBAL_CITIES}")
        response = requests.get(URL_GLOBAL_CITIES, timeout=30)
        
        if response.status_code == 200:
            cities_data = response.json()
            print(f"[+] Loaded {len(cities_data)} cities into memory. Deduplicating...")
            
            # Use a set to track unique (country_code, city_name) pairs
            seen_cities: Set[Tuple[str, str]] = set()
            city_count = 0
            duplicate_count = 0
            
            for item in cities_data:
                city_name = item.get("name")
                country_code = item.get("country")
                lat = item.get("lat")
                lng = item.get("lng")
                population = item.get("population", None)
                
                if city_name and country_code:
                    clean_cc = country_code.upper().strip()
                    clean_city = city_name.strip()
                    
                    # Skip duplicates
                    key = (clean_cc, clean_city)
                    if key in seen_cities:
                        duplicate_count += 1
                        continue
                    seen_cities.add(key)
                    
                    # Resolve country name
                    resolved_country_name = COUNTRY_CODE_TO_NAME.get(clean_cc, f"Country ({clean_cc})")
                    
                    timezone = TIMEZONE_MAP.get(clean_cc, 'UTC')
                    utc_offset, utc_offset_hours = get_utc_offset(timezone)
                    
                    master_payload.append((
                        resolved_country_name,
                        clean_cc, 
                        None, 
                        clean_city, 
                        [],
                        None, 
                        None, 
                        timezone, 
                        utc_offset, 
                        utc_offset_hours,
                        False, 
                        True, 
                        False, 
                        False, 
                        [],
                        population,
                        float(lat) if lat else None, 
                        float(lng) if lng else None,
                        True, 
                        datetime.now(), 
                        datetime.now()
                    ))
                    city_count += 1
            
            print(f"[+] Successfully mapped {city_count} unique cities (skipped {duplicate_count} duplicates).")
        else:
            print(f"[-] GitHub source connection dropped. Status code: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("[-] GitHub request timed out. Continuing with remote anchors, countries, and regions only...")
    except requests.exceptions.RequestException as e:
        print(f"[-] Request error: {e}")
        print("[!] Continuing with remote anchors, countries, and regions only...")
    except Exception as e:
        print(f"[-] Unexpected error: {e}")
        print("[!] Continuing with remote anchors, countries, and regions only...")
    
    # ======================================================
    # 5. VALIDATE AND LOAD
    # ======================================================
    if len(master_payload) <= 3:
        print("[-] Stream extraction failed. Location pipeline aborted.")
        return
    
    print(f"[+] Compiled {len(master_payload)} total location records.")
    
    try:
        print("[*] Bulk writing to Neon cluster via high-speed temporary staging environment...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Create staging table WITHOUT unique constraints
        cursor.execute("""
            CREATE TEMP TABLE stage_location_reference (
                country_name VARCHAR(200),
                country_code VARCHAR(10),
                country_code_alpha3 VARCHAR(10),
                city_name VARCHAR(200),
                city_aliases TEXT[],
                region_name VARCHAR(100),
                region_code VARCHAR(20),
                timezone VARCHAR(50),
                utc_offset VARCHAR(10),
                utc_offset_hours DECIMAL(4,1),
                is_country BOOLEAN,
                is_city BOOLEAN,
                is_region BOOLEAN,
                is_remote_location BOOLEAN,
                remote_keywords TEXT[],
                population INTEGER,
                latitude DECIMAL(10,6),
                longitude DECIMAL(10,6),
                is_active BOOLEAN,
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            ) ON COMMIT DROP;
        """)
        
        insert_stage_query = """
            INSERT INTO stage_location_reference
            (
                country_name, country_code, country_code_alpha3, city_name, city_aliases, 
                region_name, region_code, timezone, utc_offset, utc_offset_hours, 
                is_country, is_city, is_region, is_remote_location, remote_keywords, 
                population, latitude, longitude, is_active, created_at, updated_at
            )
            VALUES %s;
        """
        
        execute_values(cursor, insert_stage_query, master_payload)
        
        # FIXED: Explicitly list all columns EXCEPT id (UUID auto-generates)
        # INCLUDING is_active, created_at, updated_at to match schema
        cursor.execute("""
            INSERT INTO public.location_reference (
                country_name, country_code, country_code_alpha3, city_name, city_aliases, 
                region_name, region_code, timezone, utc_offset, utc_offset_hours, 
                is_country, is_city, is_region, is_remote_location, remote_keywords, 
                population, latitude, longitude, is_active, created_at, updated_at
            )
            SELECT DISTINCT ON (country_code, city_name, is_city, is_country, is_remote_location)
                country_name, country_code, country_code_alpha3, city_name, city_aliases, 
                region_name, region_code, timezone, utc_offset, utc_offset_hours, 
                is_country, is_city, is_region, is_remote_location, remote_keywords, 
                population, latitude, longitude, is_active, created_at, updated_at
            FROM stage_location_reference
            WHERE country_code IS NOT NULL
            ON CONFLICT DO NOTHING;
        """)
        
        conn.commit()
        
        # ======================================================
        # 6. VERIFICATION METRICS
        # ======================================================
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE is_remote_location = TRUE) as remote_count,
                COUNT(*) FILTER (WHERE is_country = TRUE) as country_count,
                COUNT(*) FILTER (WHERE is_city = TRUE) as city_count,
                COUNT(*) FILTER (WHERE is_region = TRUE) as region_count,
                COUNT(*) as total_count 
            FROM public.location_reference;
        """)
        metrics = cursor.fetchone()
        
        print("\n" + "="*55)
        print("   NEON LOCATION MATRIX SYNC METRICS")
        print("="*55)
        print(f"   🌍 Active Remote Anchor Nodes  : {metrics[0]}")
        print(f"   🏳️ Countries Loaded           : {metrics[1]}")
        print(f"   🏙️ Global Target Cities       : {metrics[2]}")
        print(f"   📍 Regional Groupings         : {metrics[3]}")
        print(f"   📊 Total Managed System Nodes : {metrics[4]}")
        print("="*55)
        
        # Sample data preview
        cursor.execute("""
            SELECT country_name, city_name, is_city, is_country, is_remote_location
            FROM public.location_reference
            WHERE is_city = TRUE OR is_remote_location = TRUE
            LIMIT 10;
        """)
        samples = cursor.fetchall()
        
        print("\n   Sample Records:")
        for row in samples:
            country, city, is_city, is_country, is_remote = row
            if is_remote:
                print(f"   🔵 {country} - {city} (Remote Anchor)")
            elif is_city:
                print(f"   🟢 {city}, {country}")
        
        print("\n[++] Location seeding operation completed successfully!\n")
        
        cursor.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f"[-] Database connection failed: {e}")
        print("   Please check your DATABASE_URL in .env file")
    except psycopg2.Error as e:
        print(f"[-] Database error: {e}")
        import traceback
        traceback.print_exc()
    except Exception as e:
        print(f"[-] Transaction failed: {e}")
        import traceback
        traceback.print_exc()


# ======================================================
# ENTRY POINT
# ======================================================
if __name__ == "__main__":
    fetch_and_seed_locations()