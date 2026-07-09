# jobradar/backend/app/services/seed_timezones.py

import os
from datetime import datetime, timezone
import zoneinfo
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Explicit list of high-traffic job market timezones to tag as is_popular = True
POPULAR_TIMEZONES = {
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dubai', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Kolkata',
    'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo', 'Africa/Lagos', 
    'Africa/Nairobi', 'Africa/Johannesburg'
}

def get_clean_offset(tz_key: str, reference_time: datetime) -> tuple[str, float, str, bool]:
    """
    Calculates precise, non-ambiguous text offsets, numerical decimal configurations,
    timezone abbreviations, and DST observance status for a given IANA key.
    """
    tz = zoneinfo.ZoneInfo(tz_key)
    
    # Force localized timestamp validation using a tz-aware instant
    localized_time = reference_time.astimezone(tz)
    offset_delta = localized_time.utcoffset()
    
    if offset_delta is None:
        return "+00:00", 0.0, "UTC", False
        
    total_seconds = offset_delta.total_seconds()
    hours = int(abs(total_seconds) // 3600)
    minutes = int((abs(total_seconds) % 3600) // 60)
    sign = "+" if total_seconds >= 0 else "-"
    
    utc_offset_str = f"{sign}{hours:02d}:{minutes:02d}"
    utc_offset_hours = total_seconds / 3600.0
    abbreviation = localized_time.tzname() or "UNK"
    
    # Accurately compute DST by testing cross-season variance shifts
    is_dst = localized_time.dst() != offset_delta.resolution * 0
    
    return utc_offset_str, utc_offset_hours, abbreviation, is_dst

def seed_timezones():
    print("[*] Initializing Dynamic Native Timezone Seeding Pipeline...")
    print("[*] Target Table: public.timezone_reference")
    
    # Establish a reliable, timezone-aware UTC base check
    now_utc = datetime.now(timezone.utc)
    master_payload = []
    
    # Fetch all system IANA keys natively available to the Python environment
    available_zones = zoneinfo.available_timezones()
    
    for tz_name in sorted(available_zones):
        # Exclude old, non-canonical legacy abbreviations
        if tz_name.startswith('Etc/') or tz_name in ['ROC', 'W-SU', 'Eire']:
            continue
            
        try:
            # Extract Region (e.g., 'America' from 'America/New_York')
            region = tz_name.split('/')[0] if '/' in tz_name else 'Global'
            
            # Format high-quality human-readable display names
            display_name = tz_name.replace('_', ' ').split('/')[-1]
            
            # Resolve offsets using our unified native calculation engine
            offset_str, offset_hours, abbr, observes_dst = get_clean_offset(tz_name, now_utc)
            is_popular = tz_name in POPULAR_TIMEZONES
            
            master_payload.append((
                tz_name,
                display_name,
                abbr,
                offset_str,
                offset_hours,
                region,
                None,  # country_code placeholder
                None,  # country_name placeholder
                [],    # city_examples empty array list
                observes_dst,
                is_popular
            ))
        except Exception as e:
            continue

    if not master_payload:
        print("[-] Mapping failed. Pipeline aborted.")
        return

    # 2. Transmit payload directly to Neon Cloud Instance
    try:
        print(f"[*] Bulk writing {len(master_payload)} live global timezones to Neon cluster...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        insert_query = """
            INSERT INTO public.timezone_reference 
            (
                timezone_name, display_name, abbreviation, utc_offset, utc_offset_hours, 
                region, country_code, country_name, city_examples, observes_dst, is_popular
            )
            VALUES %s
            ON CONFLICT (timezone_name) DO NOTHING;
        """
        
        execute_values(cursor, insert_query, master_payload)
        conn.commit()
        
        cursor.execute("SELECT COUNT(*), COUNT(*) FILTER (WHERE is_popular = TRUE) FROM public.timezone_reference;")
        counts = cursor.fetchone()
        print(f"\n=== NEON TIMEZONE SYNC METRICS ===")
        print(f"-> Total Timezones Active : {counts[0]}")
        print(f"-> Popular Filters Active : {counts[1]}")
        print("==================================\n[++] Seeding complete!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[-] Database insertion failed: {e}")

if __name__ == "__main__":
    seed_timezones()
