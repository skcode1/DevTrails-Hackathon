import numpy as np
from markov_lr import generate_synthetic_data,train_models,get_adjusted_P

##Rider Calibration
def fit_rider(s0_daily_earnings:list)->dict:
    '''
    Compute mu and sigma from the last 14 s0 daily earnings records.

    Return state boundaries and loss vector.
    '''
    arr=np.array(s0_daily_earnings)
    mu=arr.mean()
    sigma=arr.std(ddof=1)

    L=sigma*np.array([0.0,1.0,2.0,3.0])

    return {"mu":mu,"sigma":sigma,"L":L}

##Markov week-averaged distribution

def markov_pi_bar(P:np.ndarray,pi0:np.ndarray,n:int=5)->np.ndarray:
    '''
    Week average markov distribution via iteration.
    
    Check readme for details.
    
    '''

    pi=pi0.copy()
    total=np.zeros(len(pi0))
    for _ in range(n):
        pi=pi @ P
        total=+pi

    return total/n

def stationary_distribution(P:np.ndarray)->np.ndarray:
    '''
    Solve pi_inf*P=pi_inf via eigenvalue decomposition
    '''
    eigvals,eigvecs=np.linalg.eig(P.T)
    idx    = np.argmin(np.abs(eigvals - 1.0))
    pi_inf = np.real(eigvecs[:, idx])
    pi_inf = np.abs(pi_inf)
    return pi_inf / pi_inf.sum()


##Co-insurance

def apply_coinsurance(L:np.ndarray,d:float,rho:np.ndarray)->np.ndarray:
    '''
    L^ins_k=rho_k*max(0,L_k-d)
    d:deductible
    rho:coinsurance vector
    '''

    return rho*np.maximum(0,L-d)

## Premium Pricing

def price_premium(
        pi_bar:np.ndarray,
        L_ins:np.ndarray,
        lam:float=0.3,
        alpha:float=0.95,
        C:float=50.0,
        n:int=5,
)->dict:
    '''
        P_weekly = n * pi_bar * L_ins * (1 + lambda*eta)  +  VaR_alpha  +  C
 
    Components:
        pure premium   : actuarially fair floor
        entropy load   : surcharge for model uncertainty
        VaR margin     : exact PMF VaR (no normal approximation)
        opex           : fixed platform cost C
    '''

    pure=float(n*pi_bar @ L_ins)

    eps=1e-12
    H=-np.sum(pi_bar*np.log2(pi_bar+eps))
    eta=H/np.log2(4)
    entropy_load=lam*eta*pure

    order=np.argsort(L_ins)
    cdf=np.cumsum(pi_bar[order])
    var_idx=int(np.searchsorted(cdf,alpha))
    var_idx=min(var_idx,len(order)-1)
    VaR=float(L_ins[order[var_idx]])

    premium=pure*(1+lam*eta)+VaR+C

    return {
        "premium":      round(premium, 2),
        "pure_premium": round(pure, 2),
        "entropy_load": round(entropy_load, 2),
        "entropy_eta":  round(float(eta), 4),
        "VaR":          round(VaR, 2),
        "opex":         C,
    }

## Fraud detection

def fraud_check(
        claim_amount:float,
        claimed_state:int,
        pi_bar:np.ndarray,
        pi_inf:np.ndarray,
        L_ins:np.ndarray,
)->dict:
    '''
    1. Modified Z-score(Iglewicz and Hoaglin outlier test)-amount test and state blind
    2. Markov likelihood ratio-state test,amount blind
    
    '''

    ##1
    L_med   = float(np.average(L_ins, weights=pi_bar))
    MAD     = float(np.average(np.abs(L_ins - L_med), weights=pi_bar))
    Z_tilde = 0.6745 * (claim_amount - L_med) / max(MAD, 1e-12)

    if Z_tilde>3.5:
        amount_decision="FLAG"
        amount_action="Request financial documentation"

    elif Z_tilde>2.5:
        amount_decision="REVIEW"
        amount_action="Request supporting evidence"

    else:
        amount_decision="PASS"
        amount_action="Approve"

    ##2

    Lambda_k = pi_bar[claimed_state] / max(pi_inf[claimed_state], 1e-12)
 
    if Lambda_k < 0.30:
        state_decision = "FLAG"
        state_action   = "Request platform activity logs"
    elif Lambda_k < 0.70:
        state_decision = "REVIEW"
        state_action   = "Request supporting evidence"
    else:
        state_decision = "PASS"
        state_action   = "Approve"

    overall = "FLAG" if "FLAG" in (amount_decision, state_decision) else \
              "REVIEW" if "REVIEW" in (amount_decision, state_decision) else "PASS"
 
    return {
        "Z_tilde":         round(float(Z_tilde), 4),
        "amount_decision": amount_decision,
        "amount_action":   amount_action,
        "Lambda":          round(float(Lambda_k), 4),
        "state_decision":  state_decision,
        "state_action":    state_action,
        "overall":         overall,
    }


##DEMO

def print_section(title):
    print(f"\n{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}")
 
 
def run_demo(label, s0_earnings, features_today, pi0, models,
             claim_amount=None, claimed_state=None,
             rho=None, d=None, lam=0.3, alpha=0.95, C=50, n=5):
 
    print(f"\n{'='*60}")
    print(f"  RIDER: {label}")
    print(f"{'='*60}")
 
    # ── Layer 1 ───────────────────────────────────────────────────────────────
    print_section("Layer 1 — Rider calibration (14 s0 daily records)")
    rider  = fit_rider(s0_earnings)
    mu, sigma, L = rider["mu"], rider["sigma"], rider["L"]
    print(f"  mu    (daily baseline) : ₹{mu:.2f}")
    print(f"  sigma (daily std dev)  : ₹{sigma:.2f}")
    print(f"  Loss vector L          : {np.round(L, 2)}  (= sigma × [0,1,2,3])")
 
    # ── Layer 4 — co-insurance ────────────────────────────────────────────────
    if rho is None:
        rho = np.array([0.00, 0.30, 0.65, 1.00])
    if d is None:
        d = 0.05 * L[1]   # 5% of L1 as deductible
 
    L_ins = apply_coinsurance(L, d, rho)
    print(f"\n  Deductible d           : ₹{d:.2f}")
    print(f"  Co-insurance rho       : {rho}")
    print(f"  Insured loss L_ins     : {np.round(L_ins, 2)}")
 
    # ── Layer 2 — Markov ──────────────────────────────────────────────────────
    print_section("Layer 2 — Markov chain")
    P_adj  = get_adjusted_P(features_today, models)
    pi_bar = markov_pi_bar(P_adj, pi0, n=n)
    pi_inf = stationary_distribution(P_adj)
 
    print("  Adjusted P matrix:")
    states = ["s0", "s1", "s2", "s3"]
    print(f"  {'':8}" + "".join(f"{s:>8}" for s in states))
    for i, row in enumerate(P_adj):
        print(f"  from {states[i]}  " + "".join(f"{p:8.4f}" for p in row))
 
    print(f"\n  pi_bar (week-averaged) : {np.round(pi_bar, 4)}")
    print(f"  pi_inf (stationary)    : {np.round(pi_inf, 4)}")
 
    # ── Layer 3 — Premium ─────────────────────────────────────────────────────
    print_section("Layer 3 — Premium pricing")
    result = price_premium(pi_bar, L_ins, lam=lam, alpha=alpha, C=C, n=n)
    print(f"  Pure premium           : ₹{result['pure_premium']}")
    print(f"  Entropy loading        : ₹{result['entropy_load']}  (η={result['entropy_eta']})")
    print(f"  VaR margin (α={alpha})  : ₹{result['VaR']}")
    print(f"  Opex                   : ₹{result['opex']}")
    print(f"  ─────────────────────────────")
    print(f"  Weekly premium         : ₹{result['premium']}")
 
    # ── Layer 5 — Fraud ───────────────────────────────────────────────────────
    if claim_amount is not None and claimed_state is not None:
        print_section(f"Layer 5 — Fraud check (claim ₹{claim_amount}, state s{claimed_state})")
        fraud = fraud_check(claim_amount, claimed_state, pi_bar, pi_inf, L_ins)
        print(f"  Modified Z-score       : {fraud['Z_tilde']}  → {fraud['amount_decision']}")
        print(f"  Adjuster action        : {fraud['amount_action']}")
        print(f"  Markov Lambda          : {fraud['Lambda']}  → {fraud['state_decision']}")
        print(f"  Adjuster action        : {fraud['state_action']}")
        print(f"  ─────────────────────────────")
        print(f"  Overall decision       : {fraud['overall']}")
 
    return result
 
 
# ─────────────────────────────────────────────────────────────────────────────
 
if __name__ == "__main__":
 
    # Train once
    print("Training Markov ML models on synthetic data...")
    data   = generate_synthetic_data(n_riders=400, n_days=120)
    models = train_models(data)
 
    # ── Rider A: stable, good day ─────────────────────────────────────────────
    run_demo(
        label          = "Rider A — stable worker, good day",
        s0_earnings    = [1200, 1180, 1250, 1190, 1220, 1230, 1200,
                          1210, 1240, 1195, 1215, 1205, 1225, 1210],
        features_today = {
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
        pi0            = np.array([1.0, 0.0, 0.0, 0.0]),
        models         = models,
        claim_amount   = 80,
        claimed_state  = 1,
    )
 
    # ── Rider B: volatile worker, bad day ─────────────────────────────────────
    run_demo(
        label          = "Rider B — volatile worker, bad day",
        s0_earnings    = [900, 1400, 750, 1300, 850, 1350, 700,
                          1250, 820, 1420, 780, 1300, 860, 1100],
        features_today = {
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
        pi0            = np.array([0.0, 0.5, 0.5, 0.0]),
        models         = models,
        claim_amount   = 2500,    # suspicious — very high
        claimed_state  = 2,
    )
 
    # ── Rider C: fraudulent claim ─────────────────────────────────────────────
    run_demo(
        label          = "Rider C — normal week, claiming severe disruption",
        s0_earnings    = [1100, 1090, 1120, 1080, 1110, 1100, 1090,
                          1115, 1095, 1105, 1085, 1100, 1110, 1095],
        features_today = {
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
        pi0            = np.array([1.0, 0.0, 0.0, 0.0]),
        models         = models,
        claim_amount   = 320,     # reasonable amount for s3...
        claimed_state  = 3,       # ...but claiming severe on a normal week
    )