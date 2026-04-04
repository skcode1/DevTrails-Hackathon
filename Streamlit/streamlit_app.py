"""
streamlit_app.py — EquiScale Demo Frontend
============================================
Run:
    pip install streamlit requests
    streamlit run streamlit_app.py

Make sure the FastAPI server is running first:
    uvicorn api:app --reload
"""

import streamlit as st
import requests
import numpy as np

API = "http://localhost:8000"

# ── Page config ───────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="EquiScale — Income Insurance",
    page_icon="🛡️",
    layout="wide",
)

st.markdown("""
<style>
    .block-container { padding-top: 2rem; padding-bottom: 2rem; }
    .metric-card {
        background: #1a1f2e;
        border: 1px solid #2a3a4d;
        border-radius: 8px;
        padding: 16px 20px;
        text-align: center;
    }
    .metric-label {
        font-size: 11px;
        color: #7a9ab0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 4px;
    }
    .metric-value {
        font-size: 28px;
        font-weight: 600;
        color: #f0a500;
        font-family: monospace;
    }
    .metric-sub { font-size: 12px; color: #7a9ab0; }
    .badge-pass   { background:#0d2e25; color:#00c9a7; padding:6px 16px; border-radius:20px; font-weight:600; }
    .badge-review { background:#2e2200; color:#f0a500; padding:6px 16px; border-radius:20px; font-weight:600; }
    .badge-flag   { background:#2e0d0d; color:#ff5a5a; padding:6px 16px; border-radius:20px; font-weight:600; }
    div[data-testid="stMetric"] label { font-size: 11px !important; }
</style>
""", unsafe_allow_html=True)

# ── Header ────────────────────────────────────────────────────────────────────

col_h1, col_h2 = st.columns([3, 1])
with col_h1:
    st.markdown("## 🛡️ EquiScale — Weekly Income Insurance")
    st.markdown("*Personalised premium pricing & fraud detection for gig economy workers*")
with col_h2:
    try:
        r = requests.get(f"{API}/health", timeout=2)
        if r.json().get("models_loaded"):
            st.success("API online — models loaded", icon="✅")
        else:
            st.warning("API online — models loading…", icon="⏳")
    except Exception:
        st.error("API offline. Start: `uvicorn api:app --reload`", icon="🔴")

st.divider()

# ── Sidebar — Rider inputs ────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("### 👤 Rider Profile")

    st.markdown("**Last 14 s₀ daily earnings (₹)**")
    st.caption("Enter the last 14 days where the rider was in normal state")

    default_earnings = [1200,1180,1250,1190,1220,1230,1200,1210,1240,1195,1215,1205,1225,1210]

    earnings_input = st.text_area(
        "Last 14 s₀ daily earnings (₹)",
        value=", ".join(str(x) for x in default_earnings),
        height=80,
        help="Enter exactly 14 comma-separated values — daily earnings on normal (s0) days only",
    )

    # Parse and validate
    earnings = []
    earnings_error = None
    try:
        earnings = [float(x.strip()) for x in earnings_input.split(",") if x.strip()]
        if len(earnings) != 14:
            earnings_error = f"Need exactly 14 values — got {len(earnings)}"
        elif any(e <= 0 for e in earnings):
            earnings_error = "All earnings must be positive"
    except ValueError:
        earnings_error = "Invalid input — use numbers separated by commas"

    if earnings_error:
        st.error(earnings_error)
        earnings = default_earnings  # fallback so app doesn't crash


    st.markdown("---")
    st.markdown("**Current State**")
    current_state = st.selectbox(
        "Current disruption state",
        options=[0, 1, 2, 3],
        format_func=lambda x: ["s0 — Normal", "s1 — Mild", "s2 — Major", "s3 — Severe"][x],
        label_visibility="collapsed",
    )

    st.markdown("---")
    st.markdown("### 📊 Today's Features")

    earnings_velocity = st.slider(
        "Earnings velocity (5-day slope)", -1.0, 1.0, 0.12, 0.01,
        help="Positive = recovering, negative = deteriorating"
    )
    days_since_s0 = st.slider(
        "Days since last s0", 0, 14, 0,
        help="Consecutive days outside normal state"
    )
    earnings_ratio = st.slider(
        "Earnings ratio to μ̂", 0.0, 2.0, 1.05, 0.01,
        help="Today's earnings / rider's personal baseline"
    )
    active_hours = st.slider("Active hours today", 0.0, 14.0, 7.5, 0.5)
    trips = st.slider("Trips completed today", 0, 50, 22)
    cancellation_rate = st.slider("Cancellation rate (7-day)", 0.0, 1.0, 0.04, 0.01)

    col_a, col_b = st.columns(2)
    with col_a:
        day_of_week = st.selectbox(
            "Day of week",
            [0,1,2,3,4,5,6],
            format_func=lambda x: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][x],
            index=5,
        )
        is_holiday = st.toggle("Public holiday", value=False)
    with col_b:
        weather = st.slider("Weather severity", 0.0, 1.0, 0.1, 0.05)
        surge = st.toggle("Surge pricing active", value=True)

    st.markdown("---")
    st.markdown("### ⚙️ Model Parameters")
    col_p1, col_p2 = st.columns(2)
    with col_p1:
        lam   = st.number_input("λ (entropy sensitivity)", 0.0, 1.0, 0.3, 0.05)
        alpha = st.number_input("α (VaR confidence)", 0.80, 0.99, 0.95, 0.01)
    with col_p2:
        opex           = st.number_input("Opex (₹)", 0.0, 500.0, 50.0, 10.0)
        n_working_days = st.number_input("Working days/week", 1, 7, 5)

# ── Main — Tabs ───────────────────────────────────────────────────────────────

tab_price, tab_fraud, tab_matrix = st.tabs(["💰 Premium Pricing", "🔍 Fraud Detection", "📐 Markov Matrix"])

features_today = {
    "earnings_velocity_5d":  earnings_velocity,
    "days_since_last_s0":    float(days_since_s0),
    "earnings_ratio_to_mu":  earnings_ratio,
    "active_hours_today":    active_hours,
    "trips_completed_today": float(trips),
    "cancellation_rate_7d":  cancellation_rate,
    "day_of_week":           day_of_week,
    "is_holiday":            int(is_holiday),
    "weather_severity":      weather,
    "surge_active":          int(surge),
}

price_payload = {
    "rider_id":       "demo_rider",
    "s0_earnings":    earnings,
    "features_today": features_today,
    "current_state":  current_state,
    "n_working_days": int(n_working_days),
    "lam":            lam,
    "alpha":          alpha,
    "opex":           opex,
}

# ── Tab 1: Premium Pricing ────────────────────────────────────────────────────

with tab_price:
    if st.button("▶  Calculate Premium", type="primary", use_container_width=True):
        with st.spinner("Calling pricing engine…"):
            try:
                r = requests.post(f"{API}/price", json=price_payload, timeout=10)
                if r.status_code == 200:
                    st.session_state["price_result"] = r.json()
                else:
                    st.error(f"API error {r.status_code}: {r.text}")
            except Exception as e:
                st.error(f"Could not reach API: {e}")

    if "price_result" in st.session_state:
        p = st.session_state["price_result"]

        st.markdown("#### Weekly Premium Breakdown")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("📦 Pure Premium",   f"₹{p['pure_premium']}", help="Actuarially fair floor")
        c2.metric("🌡️ Entropy Load",   f"₹{p['entropy_load']}", delta=f"η={p['entropy_eta']:.3f}")
        c3.metric("📊 VaR Margin",     f"₹{p['VaR']}",         help=f"Exact PMF VaR at α={alpha}")
        c4.metric("🔧 Opex",           f"₹{p['opex']}")

        st.markdown("---")

        col_big, col_detail = st.columns([1, 2])
        with col_big:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Weekly Premium</div>
                <div class="metric-value">₹{p['premium']}</div>
                <div class="metric-sub">per week · {int(n_working_days)} working days</div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Rider Baseline</div>
                <div class="metric-value" style="font-size:20px">₹{p['mu']:.0f}</div>
                <div class="metric-sub">μ̂ = ₹{p['mu']:.2f} · σ̂ = ₹{p['sigma']:.2f}</div>
            </div>
            """, unsafe_allow_html=True)

        with col_detail:
            st.markdown("**Loss vector L_ins (after co-insurance)**")
            states = ["s0 Normal", "s1 Mild", "s2 Major", "s3 Severe"]
            L_ins  = p["L_ins"]
            for i, (s, l) in enumerate(zip(states, L_ins)):
                pct = int(l / max(L_ins[-1], 1) * 100) if L_ins[-1] > 0 else 0
                st.markdown(f"`{s}`")
                st.progress(pct / 100, text=f"₹{l:.2f}")

            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown("**Week-averaged state distribution π̄**")
            pi_bar = p["pi_bar"]
            cb = st.columns(4)
            for i, (col, name, val) in enumerate(zip(cb, ["s0","s1","s2","s3"], pi_bar)):
                col.metric(name, f"{val:.3f}")

    else:
        st.info("Configure rider inputs in the sidebar and click **Calculate Premium**.")

# ── Tab 2: Fraud Detection ────────────────────────────────────────────────────

with tab_fraud:
    st.markdown("#### Submit a Claim")

    col_f1, col_f2 = st.columns(2)
    with col_f1:
        claim_amount  = st.number_input("Claim amount (₹)", min_value=0.01, value=4.0, step=1.0)
    with col_f2:
        claimed_state = st.selectbox(
            "Claimed disruption state",
            [0, 1, 2, 3],
            format_func=lambda x: ["s0 — Normal", "s1 — Mild", "s2 — Major", "s3 — Severe"][x],
            index=1,
        )

    if st.button("🔍  Run Fraud Check", type="primary", use_container_width=True):
        fraud_payload = {
            **price_payload,
            "claim_amount":  claim_amount,
            "claimed_state": claimed_state,
        }
        with st.spinner("Running fraud pipeline…"):
            try:
                r = requests.post(f"{API}/price-and-fraud", json=fraud_payload, timeout=10)
                if r.status_code == 200:
                    st.session_state["fraud_result"] = r.json()
                else:
                    st.error(f"API error {r.status_code}: {r.text}")
            except Exception as e:
                st.error(f"Could not reach API: {e}")

    if "fraud_result" in st.session_state:
        fr  = st.session_state["fraud_result"]["fraud"]
        pr  = st.session_state["fraud_result"]

        overall = fr["overall"]
        badge_class = {"PASS": "badge-pass", "REVIEW": "badge-review", "FLAG": "badge-flag"}[overall]
        icon        = {"PASS": "✅", "REVIEW": "⚠️", "FLAG": "🚨"}[overall]

        st.markdown(f"""
        <div style="text-align:center; margin: 16px 0;">
            <span class="{badge_class}">{icon} Overall: {overall}</span>
        </div>
        """, unsafe_allow_html=True)

        col_g1, col_g2 = st.columns(2)

        with col_g1:
            d = fr["amount_decision"]
            color = {"PASS":"#00c9a7","REVIEW":"#f0a500","FLAG":"#ff5a5a"}[d]
            st.markdown(f"**Step 1 — Amount Test** (state-blind)")
            st.markdown(f"Modified Z̃ score: `{fr['Z_tilde']}`")
            st.markdown(f"Decision: :{color}[**{d}**]")
            st.caption(f"Adjuster action: {fr['amount_action']}")

        with col_g2:
            d = fr["state_decision"]
            color = {"PASS":"#00c9a7","REVIEW":"#f0a500","FLAG":"#ff5a5a"}[d]
            st.markdown(f"**Step 2 — State Test** (amount-blind)")
            st.markdown(f"Markov Λ ratio: `{fr['Lambda']}`")
            st.markdown(f"Decision: :{color}[**{d}**]")
            st.caption(f"Adjuster action: {fr['state_action']}")

        st.markdown("---")
        st.markdown("**Decision matrix**")
        matrix_data = {
            "":                    ["Amount OK (Z̃ ≤ 3.5)", "Amount suspicious (Z̃ > 3.5)"],
            "State plausible (Λ ≥ 0.3)":   ["✅ Approve",           "🚨 Flag — financial docs"],
            "State implausible (Λ < 0.3)": ["🚨 Flag — activity logs","🚨 Flag — both signals"],
        }
        st.table(matrix_data)

    else:
        st.info("Fill in claim details above and click **Run Fraud Check**.")

# ── Tab 3: Markov Matrix ──────────────────────────────────────────────────────

with tab_matrix:
    st.markdown("#### Adjusted Transition Matrix P(t)")
    st.caption("ML-adjusted using today's feature vector. Each row = transition probabilities from that state.")

    result = st.session_state.get("price_result") or st.session_state.get("fraud_result")

    if result:
        P     = np.array(result["P_adjusted"])
        pi_bar = result["pi_bar"]
        pi_inf = result["pi_inf"]
        states = ["s0 Normal", "s1 Mild", "s2 Major", "s3 Severe"]

        import pandas as pd
        df = pd.DataFrame(P, index=[f"From {s}" for s in states],
                             columns=[f"→ {s}" for s in states])
        df = df.round(4)

        st.dataframe(
            df.style
              .background_gradient(cmap="YlOrBr", axis=1)
              .format("{:.4f}"),
            use_container_width=True,
        )

        st.markdown("---")
        col_pb, col_pi = st.columns(2)

        with col_pb:
            st.markdown("**π̄ — Week-averaged distribution**")
            st.caption("Used for premium pricing (cumulative disruption across the week)")
            pi_df = pd.DataFrame({"State": states, "π̄": pi_bar}).set_index("State")
            st.bar_chart(pi_df)

        with col_pi:
            st.markdown("**π∞ — Stationary distribution**")
            st.caption("Population base rate — used as denominator in fraud Λ test")
            pi_inf_df = pd.DataFrame({"State": states, "π∞": pi_inf}).set_index("State")
            st.bar_chart(pi_inf_df)

    else:
        st.info("Run the pricing engine first (Premium Pricing tab) to see the matrix.")
