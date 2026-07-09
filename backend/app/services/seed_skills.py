# jobradar/backend/app/services/database.py

import os
import csv
import json
import requests
from typing import List, Tuple
from psycopg2.extras import execute_values
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# --- REMOTE SOURCE RAW DATA URLS ---
# --- REMOTE SOURCE RAW DATA URLS ---
# Updated working repository locations
URL_SAHIL_TECH = "https://raw.githubusercontent.com/sahilrahmann/Technology-Lookup-Web-Application/refs/heads/main/technologies.csv"
URL_LEADITA_TECH = "https://raw.githubusercontent.com/leadita/tech-stack-datasets/refs/heads/master/datasets/technologies.json"
URL_CAIORSS_SKILLS = "https://gist.githubusercontent.com/caiorss/a08cbd667d5ddb56b4e0a1b10dd0ebf6/raw/keywords.json"
URL_MICROSOFT_TITLES = "https://raw.githubusercontent.com/microsoft/LUIS-Samples/refs/heads/master/documentation-samples/tutorials/job-phrase-list.csv"
DATABASE_URL = os.getenv("DATABASE_URL")

def normalize_text(text: str) -> str:
    """Helper to cleanly strip out anomalies and lowercase text tracking elements."""
    return text.strip().lower() if text else ""

def fetch_sahil_tech() -> List[Tuple[str, str, str]]:
    results = []
    try:
        res = requests.get(URL_SAHIL_TECH, timeout=15)
        if res.status_code == 200:
            reader = csv.reader(res.text.splitlines())
            for row in reader:
                if row and row[0].strip():
                    kw = row[0].strip()
                    results.append((kw, normalize_text(kw), "tech_stack"))
    except Exception as e:
        print(f"[-] Error fetching Sahil Tech Stack: {e}")
    return results

def fetch_leadita_tech() -> List[Tuple[str, str, str]]:
    results = []
    try:
        res = requests.get(URL_LEADITA_TECH, timeout=15)
        if res.status_code == 200:
            data = res.json()
            items_list = data if isinstance(data, list) else []
            if isinstance(data, dict):
                for _, items in data.items():
                    if isinstance(items, list): items_list.extend(items)
            
            for item in items_list:
                name = item.get("name") if isinstance(item, dict) else str(item)
                if name and name.strip():
                    kw = name.strip()
                    results.append((kw, normalize_text(kw), "tech_stack"))
    except Exception as e:
        print(f"[-] Error fetching Leadita Tech Dataset: {e}")
    return results

def fetch_caiorss_skills() -> List[Tuple[str, str, str]]:
    results = []
    try:
        res = requests.get(URL_CAIORSS_SKILLS, timeout=15)
        if res.status_code == 200:
            skills = res.json()
            if isinstance(skills, list):
                for skill in skills:
                    if skill and str(skill).strip():
                        kw = str(skill).strip()
                        results.append((kw, normalize_text(kw), "skill"))
    except Exception as e:
        print(f"[-] Error fetching Caiorss Skills: {e}")
    return results

def fetch_microsoft_titles() -> List[Tuple[str, str, str]]:
    results = []
    try:
        res = requests.get(URL_MICROSOFT_TITLES, timeout=15)
        if res.status_code == 200:
            reader = csv.reader(res.text.splitlines())
            for row in reader:
                if row and row[0].strip():
                    kw = row[0].strip()
                    if kw.lower() in ["job title", "title", "phrase"]: continue
                    results.append((kw, normalize_text(kw), "role"))
    except Exception as e:
        print(f"[-] Error fetching Microsoft Job Titles: {e}")
    return results

def seed_complete_keyword_matrix():
    print("[*] Initializing Master JobRadar In-Memory Seeding Pipeline...")
    print("[*] Target Table: public.keyword_reference")
    
    # 1. Collect elements from all 4 live streaming files
    raw_payload: List[Tuple[str, str, str]] = []
    raw_payload.extend(fetch_sahil_tech())
    raw_payload.extend(fetch_leadita_tech())
    raw_payload.extend(fetch_caiorss_skills())
    raw_payload.extend(fetch_microsoft_titles())
    
    if not raw_payload:
        print("[-] Stream data array is empty. Script execution terminated.")
        return

    # 2. Prevent primary key clash duplication on unique keywords
    seen_keywords = set()
    master_payload = []
    for item in raw_payload:
        if item[1] not in seen_keywords and item[1] != "":
            seen_keywords.add(item[1])
            master_payload.append(item)
            
    print(f"[+] Compiled {len(master_payload)} unique memory elements.")

    # 3. Connect to Neon Cloud instance and execute batch query operations
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        insert_query = """
            INSERT INTO public.keyword_reference (keyword, normalized_keyword, category) 
            VALUES %s 
            ON CONFLICT (keyword) DO NOTHING;
        """
        
        print("[*] Pushing data streams into your live Neon cloud infrastructure...")
        execute_values(cursor, insert_query, master_payload)
        
        conn.commit()
        
        cursor.execute("SELECT category, COUNT(*) FROM public.keyword_reference GROUP BY category;")
        metrics = cursor.fetchall()
        
        print("\n=== KEYWORD_REFERENCE METRICS ===")
        for metric in metrics:
            print(f"-> Category: {metric[0]:<20} | Total Records Loaded: {metric[1]}")
        print("==================================\n[++] Live seeding execution finished!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"[-] Data transmission or validation parsing failed: {e}")

if __name__ == "__main__":
    seed_complete_keyword_matrix()