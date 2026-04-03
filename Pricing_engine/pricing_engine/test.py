"""
test_cases.py — Manual API test cases
=======================================
Hits a live running server. Start the server first:
    uvicorn api:app --reload

Then run:
    python test_cases.py
"""

import requests

BASE = "http://localhost:8000"

# ── Shared payloads ───────────────────────────────────────────────────────────

STABLE_GOOD_DAY = {
    "rider_id":    "stable_rider",
    "s0_earnings": [1200, 1180, 1250, 1190, 1220, 1230, 1200,
                    1210, 1240, 1195, 1215, 1205, 1225, 1210],
    "features_today": {
        "earnings_velocity_5d":  0.12,
        "days_since_last_s0":    0,
        "earnings_ratio_to_mu":  1.05,
        "active_hours_today":    7.5,
        "trips_completed_today": 22,
        "cancellation_rate_7d":  0.04,
        "day_of_week":           5,
        "is_holiday":            0,
        "weather_severity":      0.1,
        "surge_active":          1,
    },
    "current_state": 0,
}

VOLATILE_BAD_DAY = {
    "rider_id":    "volatile_rider",
    "s0_earnings": [900, 1400, 750, 1300, 850, 1350, 700,
                    1250, 820, 1420, 780, 1300, 860, 1100],
    "features_today": {
        "earnings_velocity_5d": -0.35,
        "days_since_last_s0":    4,
        "earnings_ratio_to_mu":  0.38,
        "active_hours_today":    1.2,
        "trips_completed_today": 3,
        "cancellation_rate_7d":  0.48,
        "day_of_week":           1,
        "is_holiday":            0,
        "weather_severity":      0.82,
        "surge_active":          0,
    },
    "current_state": 2,
}

FRAUD_RIDER = {
    "rider_id":    "fraud_rider",
    "s0_earnings": [1100, 1090, 1120, 1080, 1110, 1100, 1090,
                    1115, 1095, 1105, 1085, 1100, 1110, 1095],
    "features_today": {
        "earnings_velocity_5d":  0.05,
        "days_since_last_s0":    0,
        "earnings_ratio_to_mu":  0.98,
        "active_hours_today":    6.8,
        "trips_completed_today": 19,
        "cancellation_rate_7d":  0.06,
        "day_of_week":           3,
        "is_holiday":            0,
        "weather_severity":      0.15,
        "surge_active":          0,
    },
    "current_state": 0,
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def ok(label, value=""):
    print(f"  [PASS]  {label}  {value}")

def fail(label, value=""):
    print(f"  [FAIL]  {label}  {value}")

def check(label, condition, value=""):
    ok(label, value) if condition else fail(label, value)


# ── Test cases ────────────────────────────────────────────────────────────────

def test_health():
    section("GET /health")
    r = requests.get(f"{BASE}/health")
    check("status 200",        r.status_code == 200)
    check("models_loaded true", r.json().get("models_loaded") is True)


def test_price_stable_rider():
    section("POST /price — stable rider, good day")
    r = requests.post(f"{BASE}/price", json=STABLE_GOOD_DAY)
    check("status 200", r.status_code == 200)
    b = r.json()
    print(f"  mu=₹{b['mu']}  sigma=₹{b['sigma']}")
    print(f"  pi_bar={b['pi_bar']}")
    print(f"  pure_premium=₹{b['pure_premium']}  entropy_load=₹{b['entropy_load']}  VaR=₹{b['VaR']}")
    print(f"  → weekly premium = ₹{b['premium']}")
    check("premium > 0",              b["premium"] > 0)
    check("pi_bar sums to 1",         abs(sum(b["pi_bar"]) - 1.0) < 1e-3)
    check("P rows sum to 1",          all(abs(sum(row) - 1.0) < 1e-3 for row in b["P_adjusted"]))
    check("entropy eta in [0,1]",     0 <= b["entropy_eta"] <= 1)
    check("components add up",
          abs(b["pure_premium"] + b["entropy_load"] + b["VaR"] + b["opex"] - b["premium"]) < 0.1,
          f"({b['pure_premium']} + {b['entropy_load']} + {b['VaR']} + {b['opex']})")


def test_price_volatile_rider():
    section("POST /price — volatile rider, bad day")
    r = requests.post(f"{BASE}/price", json=VOLATILE_BAD_DAY)
    check("status 200", r.status_code == 200)
    b = r.json()
    print(f"  sigma=₹{b['sigma']}  → weekly premium = ₹{b['premium']}")

    r_stable = requests.post(f"{BASE}/price", json=STABLE_GOOD_DAY).json()
    check("volatile premium > stable premium",
          b["premium"] > r_stable["premium"],
          f"(₹{b['premium']} vs ₹{r_stable['premium']})")


def test_price_validation():
    section("POST /price — input validation")

    # Too few s0 records
    bad = {**STABLE_GOOD_DAY, "s0_earnings": [1200] * 10}
    r   = requests.post(f"{BASE}/price", json=bad)
    check("422 on < 14 s0 records", r.status_code == 422)

    # Invalid state
    bad = {**STABLE_GOOD_DAY, "current_state": 9}
    r   = requests.post(f"{BASE}/price", json=bad)
    check("422 on invalid current_state", r.status_code == 422)

    # Weather out of range
    bad = {**STABLE_GOOD_DAY, "features_today": {
        **STABLE_GOOD_DAY["features_today"], "weather_severity": 2.0
    }}
    r = requests.post(f"{BASE}/price", json=bad)
    check("422 on weather_severity > 1", r.status_code == 422)

    # Missing field
    bad = {k: v for k, v in STABLE_GOOD_DAY.items() if k != "current_state"}
    r   = requests.post(f"{BASE}/price", json=bad)
    check("422 on missing current_state", r.status_code == 422)


def test_fraud_legitimate_claim():
    section("POST /fraud — legitimate claim (stable rider, small s1 amount)")
    payload = {**STABLE_GOOD_DAY, "claim_amount": 4, "claimed_state": 1}
    r       = requests.post(f"{BASE}/fraud", json=payload)
    check("status 200", r.status_code == 200)
    b = r.json()
    print(f"  Z_tilde={b['Z_tilde']}  ({b['amount_decision']})")
    print(f"  Lambda={b['Lambda']}    ({b['state_decision']})")
    print(f"  → overall: {b['overall']}")
    check("overall PASS", b["overall"] == "PASS")


def test_fraud_inflated_amount():
    section("POST /fraud — inflated amount (claim >> loss vector)")
    payload = {**STABLE_GOOD_DAY, "claim_amount": 50000, "claimed_state": 1}
    r       = requests.post(f"{BASE}/fraud", json=payload)
    check("status 200", r.status_code == 200)
    b = r.json()
    print(f"  Z_tilde={b['Z_tilde']}  → {b['amount_decision']}")
    check("amount flagged", b["amount_decision"] == "FLAG")
    check("overall FLAG",   b["overall"] == "FLAG")


def test_fraud_state_fabrication():
    section("POST /fraud — state fabrication (normal week, claiming severe)")
    payload = {**FRAUD_RIDER, "claim_amount": 30, "claimed_state": 3}
    r       = requests.post(f"{BASE}/fraud", json=payload)
    check("status 200", r.status_code == 200)
    b = r.json()
    print(f"  Z_tilde={b['Z_tilde']}  Lambda={b['Lambda']}")
    print(f"  → overall: {b['overall']}")
    check("overall FLAG or REVIEW", b["overall"] in ("FLAG", "REVIEW"))


def test_fraud_validation():
    section("POST /fraud — input validation")

    # Zero claim
    bad = {**STABLE_GOOD_DAY, "claim_amount": 0, "claimed_state": 1}
    r   = requests.post(f"{BASE}/fraud", json=bad)
    check("422 on zero claim_amount", r.status_code == 422)

    # Invalid claimed state
    bad = {**STABLE_GOOD_DAY, "claim_amount": 100, "claimed_state": 5}
    r   = requests.post(f"{BASE}/fraud", json=bad)
    check("422 on invalid claimed_state", r.status_code == 422)


def test_price_and_fraud():
    section("POST /price-and-fraud — combined call")
    payload = {**STABLE_GOOD_DAY, "claim_amount": 4, "claimed_state": 1}
    r       = requests.post(f"{BASE}/price-and-fraud", json=payload)
    check("status 200", r.status_code == 200)
    b = r.json()
    check("has premium field", "premium" in b)
    check("has fraud field",   "fraud" in b)
    print(f"  premium=₹{b['premium']}  fraud_overall={b['fraud']['overall']}")

    # Consistency with individual endpoints
    r_price = requests.post(f"{BASE}/price", json=STABLE_GOOD_DAY).json()
    r_fraud = requests.post(f"{BASE}/fraud", json=payload).json()
    check("premium matches /price",        b["premium"] == r_price["premium"])
    check("fraud.overall matches /fraud",  b["fraud"]["overall"] == r_fraud["overall"])
    check("fraud.Z_tilde matches /fraud",  b["fraud"]["Z_tilde"] == r_fraud["Z_tilde"])


# ── Run all ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [
        test_health,
        test_price_stable_rider,
        test_price_volatile_rider,
        test_price_validation,
        test_fraud_legitimate_claim,
        test_fraud_inflated_amount,
        test_fraud_state_fabrication,
        test_fraud_validation,
        test_price_and_fraud,
    ]

    for t in tests:
        try:
            t()
        except requests.exceptions.ConnectionError:
            print(f"\n  [ERROR] Could not connect to {BASE}")
            print("  Make sure the server is running: uvicorn api:app --reload")
            break
        except Exception as e:
            print(f"\n  [ERROR] {t.__name__} raised: {e}")

    print(f"\n{'='*60}")
    print("  Done.")
    print(f"{'='*60}\n")