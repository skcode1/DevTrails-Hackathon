"""
Canonical defaults for pricing requests (everything except s0_earnings).
Served by GET /pricing-defaults so clients do not duplicate these values.

Keep in sync with EquiScale/public/defaults.json (fallback when the API is down).
"""

S0_RECORD_COUNT = 14

FEATURES_TODAY = {
    "earnings_velocity_5d": 0.12,
    "days_since_last_s0": 0.0,
    "earnings_ratio_to_mu": 1.05,
    "active_hours_today": 7.5,
    "trips_completed_today": 22.0,
    "cancellation_rate_7d": 0.04,
    "day_of_week": 5,
    "is_holiday": 0,
    "weather_severity": 0.1,
    "surge_active": 1,
}


def pricing_request_template() -> dict:
    return {
        "rider_id": "rider_1",
        "features_today": dict(FEATURES_TODAY),
        "current_state": 0,
        "n_working_days": 5,
        "lam": 0.3,
        "alpha": 0.95,
        "opex": 50.0,
        "deductible_pct": 0.05,
        "rho": [0.0, 0.3, 0.65, 1.0],
    }


def ui_defaults() -> dict:
    """Optional labels for web shells; edit this dict or extend the API later."""
    return {
        "appName": "",
        "userName": "",
        "userRole": "",
        "orgName": "",
        "appVersion": "",
    }
