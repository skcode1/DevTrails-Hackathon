

import numpy as np
from markov_lr import get_adjusted_P




def fit_rider(s0_daily_earnings: list[float]) -> dict:
    """
    Compute mu and sigma from the last 14 s0 daily earnings records.

    Parameters
    ----------
    s0_daily_earnings : list of 14 floats (₹)

    Returns
    -------
    dict with keys: mu, sigma, L
        mu    — sample mean of daily earnings in normal state
        sigma — sample std dev
        L     — loss vector = sigma * [0, 1, 2, 3]
    """
    arr   = np.array(s0_daily_earnings, dtype=float)
    mu    = float(arr.mean())
    sigma = float(arr.std(ddof=1))
    L     = sigma * np.array([0.0, 1.0, 2.0, 3.0])
    return {"mu": mu, "sigma": sigma, "L": L}




def apply_coinsurance(
    L:   np.ndarray,
    d:   float,
    rho: np.ndarray,
) -> np.ndarray:
    """
    L^ins_k = rho_k * max(0, L_k - d)

    Parameters
    ----------
    L   : loss vector [L0, L1, L2, L3]
    d   : deductible (₹)
    rho : co-insurance ratios [rho0, rho1, rho2, rho3]

    Returns
    -------
    L_ins : insured loss vector (₹)
    """
    return rho * np.maximum(0.0, L - d)




def markov_pi_bar(
    P:   np.ndarray,
    pi0: np.ndarray,
    n:   int = 5,
) -> np.ndarray:
    """
    Week-averaged Markov distribution.
    pi_bar = (1/n) * sum_{t=1}^{n} pi_0 * P^t

    Normalised by sum (not /n) to correct floating-point drift.

    Parameters
    ----------
    P   : (4, 4) row-stochastic transition matrix
    pi0 : (4,) initial state distribution
    n   : working days in the week

    Returns
    -------
    pi_bar : (4,) week-averaged distribution, sums to 1
    """
    pi    = pi0.astype(float).copy()
    total = np.zeros(4)
    for _ in range(n):
        pi     = pi @ P
        total += pi
    return total / total.sum()


def stationary_distribution(P: np.ndarray) -> np.ndarray:

    eigvals, eigvecs = np.linalg.eig(P.T)
    idx    = np.argmin(np.abs(eigvals - 1.0))
    pi_inf = np.real(eigvecs[:, idx])
    pi_inf = np.abs(pi_inf)
    return pi_inf / pi_inf.sum()



def price_premium(
    pi_bar: np.ndarray,
    L_ins:  np.ndarray,
    lam:    float = 0.3,
    alpha:  float = 0.95,
    C:      float = 50.0,
    n:      int   = 5,
) -> dict:


    pure = float(n * pi_bar @ L_ins)

    eps  = 1e-12
    H    = float(-np.sum(pi_bar * np.log2(pi_bar + eps)))
    eta  = H / np.log2(4)
    entropy_load = lam * eta * pure

    order   = np.argsort(L_ins)
    cdf     = np.cumsum(pi_bar[order])
    var_idx = int(np.searchsorted(cdf, alpha))
    var_idx = min(var_idx, len(order) - 1)
    VaR     = float(L_ins[order[var_idx]])

    premium = pure * (1 + lam * eta) + VaR + C

    return {
        "premium":      round(premium, 2),
        "pure_premium": round(pure, 2),
        "entropy_load": round(entropy_load, 2),
        "entropy_eta":  round(float(eta), 4),
        "VaR":          round(VaR, 2),
        "opex":         C,
    }

def weighted_median(values:np.ndarray,weights:np.ndarray)->float:
    order=np.argsort(values)
    v,w=values[order],weights[order]
    cdf=np.cumsum(w)
    return float(v[np.searchsorted(cdf,0.5*cdf[-1])])



def fraud_check(
    claim_amount:  float,
    claimed_state: int,
    pi_bar:        np.ndarray,
    pi_inf:        np.ndarray,
    L_ins:         np.ndarray,
) -> dict:
    """
    Two sequential, independent fraud tests.
 
    Step 1 — Modified Z-score (amount test, state-blind)
        Uses weighted MAD. Falls back to weighted std when MAD = 0
        (occurs when pi_bar is concentrated in s0 and L_ins[0] = 0).
 
    Step 2 — Markov likelihood ratio (state test, amount-blind)
        Lambda_k = pi_bar[k] / pi_inf[k]
 
    Returns
    -------
    dict with keys:
        Z_tilde, amount_decision, amount_action,
        Lambda, state_decision, state_action, overall
    """
    L_med=weighted_median(L_ins,pi_bar)
    MAD=weighted_median(np.abs(L_ins-L_med),pi_bar)

    if MAD < 1e-6:
        scale = float(np.sqrt(np.average((L_ins - L_med) ** 2, weights=pi_bar)))
        scale = max(scale, 1e-6)
    else:
        scale = MAD

    Z_tilde = 0.6745 * (claim_amount - L_med) / scale

    if Z_tilde > 3.5:
        amount_decision = "FLAG"
        amount_action   = "Request financial documentation"
    elif Z_tilde > 2.5:
        amount_decision = "REVIEW"
        amount_action   = "Request supporting evidence"
    else:
        amount_decision = "PASS"
        amount_action   = "Approve"

    Lambda_k = float(pi_bar[claimed_state]) / max(float(pi_inf[claimed_state]), 1e-12)

    if Lambda_k < 0.30:
        state_decision = "FLAG"
        state_action   = "Request platform activity logs"
    elif Lambda_k < 0.70:
        state_decision = "REVIEW"
        state_action   = "Request supporting evidence"
    else:
        state_decision = "PASS"
        state_action   = "Approve"

    overall = (
        "FLAG"   if "FLAG"   in (amount_decision, state_decision) else
        "REVIEW" if "REVIEW" in (amount_decision, state_decision) else
        "PASS"
    )

    return {
        "Z_tilde":         round(float(Z_tilde), 4),
        "amount_decision": amount_decision,
        "amount_action":   amount_action,
        "Lambda":          round(float(Lambda_k), 4),
        "state_decision":  state_decision,
        "state_action":    state_action,
        "overall":         overall,
    }



def run_engine(
    s0_earnings:    list[float],
    features_today: dict,
    current_state:  int,
    lr_models:      dict,
    n:              int   = 5,
    lam:            float = 0.3,
    alpha:          float = 0.95,
    C:              float = 50.0,
    deductible_pct: float = 0.05,
    rho:            list  = None,
) -> dict:
    """
    Run layers 1-4 and return all intermediate quantities.
    Called by both /price and /price-and-fraud endpoints.
    """
    if rho is None:
        rho = [0.0, 0.30, 0.65, 1.00]

    rider        = fit_rider(s0_earnings)
    mu, sigma, L = rider["mu"], rider["sigma"], rider["L"]
    rho_arr      = np.array(rho)
    d            = deductible_pct * L[1]
    L_ins        = apply_coinsurance(L, d, rho)

    P_adj  = get_adjusted_P(features_today, lr_models)
    pi0    = np.zeros(4); pi0[current_state] = 1.0
    pi_bar = markov_pi_bar(P_adj, pi0, n=n)
    pi_inf = stationary_distribution(P_adj)
    pricing = price_premium(pi_bar, L_ins, lam=lam, alpha=alpha, C=C, n=n)

    return {
        "mu":          round(mu, 2),
        "sigma":       round(sigma, 2),
        "L":           [round(x, 2) for x in L],
        "L_ins":       [round(x, 2) for x in L_ins],
        "pi_bar":      [round(x, 4) for x in pi_bar],
        "pi_inf":      [round(x, 4) for x in pi_inf],
        "P_adjusted":  [[round(p, 4) for p in row] for row in P_adj],
        "_L_ins_arr":  L_ins,
        "_pi_bar_arr": pi_bar,
        "_pi_inf_arr": pi_inf,
        **pricing,
    }







