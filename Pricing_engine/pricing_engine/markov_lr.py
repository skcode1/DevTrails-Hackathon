import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings("ignore")


'''Base Matrix(population-level)'''

P_BASE=np.array([
    [0.75, 0.15, 0.07, 0.03],   # from s0 — mostly stays normal
    [0.35, 0.40, 0.18, 0.07],   # from s1 — moderate recovery
    [0.15, 0.25, 0.40, 0.20],   # from s2 — slow recovery
    [0.10, 0.15, 0.30, 0.45],   # from s3 — disruption persists
])

STATES=[0,1,2,3]
STATE_NAMES=["s0_normal","s1_mild","s2_major","s3_severe"]

'''
--------------------FEATURES------------------
1. earning velocity:gradient of earnings vs personal baseline
2. last S0:consecutive days outside normal S0
3. earning ratio: today's earing /rider mean
4. active hours today
5. trips completed today
6. cancellation rate in 7d
7. day of the week
8. Is holiday:binary
9. weather severity:o-1 normalized
10. Surge:binary

'''





FEATURES=[
    "earnings_velocity_5d",
    "days_since_last_s0",
    "earnings_ratio_to_mu",
    "active_hours_today",
    "trips_completed_today",
    "cancellation_rate_7d",
    "day_of_week",
    "is_holiday",
    "weather_severity",
    "surge_active",
]

'''
Simulating rider history
'''

def _simulate_rider(n_days,mu,sigma,rng):
    rows=[]
    state=0
    days_since_s0=0
    earnings_history=[mu]*5

    for day in range(n_days):
        dow=day%7
        is_holiday=int(rng.random()<0.04)
        weather=float(np.clip(rng.normal(0.3,0.2),0,1))
        surge=int(rng.random()<(0.25+0.15*(dow>=5)))

        P_adj=P_BASE.copy()
        if weather>0.6:
            P_adj[0,0]-=0.12; P_adj[0, 1] += 0.08; P_adj[0, 2] += 0.04
            P_adj[1, 0] -= 0.08; P_adj[1, 1] += 0.08
            P_adj[2, 0] -= 0.05; P_adj[2, 2] += 0.05

        if is_holiday:
             P_adj[0, 0] += 0.10; P_adj[0, 1] -= 0.06; P_adj[0, 2] -= 0.04

        if surge:
            P_adj[:, 0] += 0.05; P_adj[:, 1] -= 0.03; P_adj[:, 2] -= 0.02

        if days_since_s0>3:
            P_adj[1, 0] -= 0.10; P_adj[1, 1] += 0.10
            P_adj[2, 0] -= 0.05; P_adj[2, 2] += 0.05
            P_adj[3, 0] -= 0.05; P_adj[3, 3] += 0.05

        next_state  = int(rng.choice(STATES, p=P_adj[state]))
        state_scale = [1.0, 0.75, 0.50, 0.25][state]
        earnings    = max(0, rng.normal(mu * state_scale, sigma * 0.4))

        earnings_ratio=earnings/max(mu,1)
        rolling_mean=np.mean(earnings_history[-5:])/max(mu,1)
        velocity=earnings_ratio-rolling_mean
        earnings_history.append(earnings)

        cancel_base=[0.05, 0.15, 0.30, 0.50][state]
        cancel_rate = float(np.clip(rng.normal(cancel_base, 0.03), 0, 1))


        active_hours    = float(np.clip(
        rng.normal(6, 1.5) + [0, -1.8, -3.5, -5.0][state], 0, 14))

        trips_completed = int(np.clip(active_hours * rng.uniform(2, 4), 0, 50))



        rows.append({
            "state":                 state,
            "next_state":            next_state,
            "earnings_velocity_5d":  velocity,
            "days_since_last_s0":    days_since_s0,
            "earnings_ratio_to_mu":  earnings_ratio,
            "active_hours_today":    active_hours,
            "trips_completed_today": trips_completed,
            "cancellation_rate_7d":  cancel_rate,
            "day_of_week":           dow,
            "is_holiday":            is_holiday,
            "weather_severity":      weather,
            "surge_active":          surge,
        })
            


        days_since_s0=0 if state==0 else days_since_s0+1
        state=next_state


    return pd.DataFrame(rows)


def generate_synthetic_data(n_riders=400,n_days=120,seed=42):
    '''
    Generates the data the model will trained on
    The matrix will be flatenned for optimization during training phase.

    reaturns FEATURES+state+next_state and rider id
    rider id is a logical primary key
    '''



    rng=np.random.default_rng(seed)
    dfs=[]
    for rider_id in range(n_riders):
        mu=rng.uniform(600,2000)
        sig=rng.uniform(80,400)
        df=_simulate_rider(n_days,mu,sig,rng)
        df["rider_id"]=rider_id
        dfs.append(df)
    return pd.concat(dfs,ignore_index=True)


def train_models(data):
    '''
    Train one logistic regression model per current state.
    Each model predicts P(next_state|current_state=s,features)

    Parameter:features+[state,next_state]

    returns: dict{state_int:fitted pipeline}
    
    
    '''

    models={}
    print("Training logistic regression models(one per state):\n")

    for s in STATES:
        subset=data[data["state"]==s]
        X=subset[FEATURES].values
        y=subset["next_state"].values
        if len(np.unique(y))<2:
            print(f"s{s}:insufficient class diversity-using base P row")
            models[s]=None
            continue
        pipe=Pipeline([
            ("scaler",StandardScaler()),
            ("lr",LogisticRegression(
                C=1.0,
                solver="lbfgs",
                penalty="l2",
                max_iter=1000,
                random_state=42
            ))
        ])
        pipe.fit(X,y)
        acc=(pipe.predict(X)==y).mean()
        print(f"  s{s} ({STATE_NAMES[s]:12s})  "
              f"{len(subset):>6,} samples  train-acc={acc:.3f}")
        models[s]=pipe

    print()
    return models


def get_P_row(current_sate,features_today,models):
    '''
    Get one row of the adjusted P matrix for a given current state.

    Parameters:
    current state
    features today
    models

    Returns:
    np.ndarray shape(4,) sums approximately to 1.0(floating point precision error)
    '''


    model=models[current_sate]
    if model is None:
        return P_BASE[current_sate].copy()
    
    x=np.array([[features_today[f] for f in FEATURES]])
    probs=model.predict_proba(x)[0]
    classes=model.named_steps["lr"].classes_

    row=np.zeros(4)
    for cls,p in zip(classes,probs):
        row[cls]=p

    return row


def get_adjusted_P(features_today,models):
    '''
    Build the full transition probability matrix from today's features.

    Parameters
    features today
    models

    returns
     4x4 np.ndarray TPM
    
    '''

    return np.vstack([
        get_P_row(s,features_today,models)
        for s in STATES
    ])

#DEMO

if __name__ == "__main__":
    print("=" * 60)
    print("Generating synthetic data...")
    data = generate_synthetic_data(n_riders=400, n_days=120)
    dist = {s: int((data["state"] == s).sum()) for s in STATES}
    print(f"Dataset: {len(data):,} rows  |  state distribution: {dist}\n")
 
    models = train_models(data)
 
    scenario_good = {
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
    }
 
    scenario_bad = {
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
    }
 
    header = "          " + "  ".join(f"{n:>10}" for n in STATE_NAMES)
    for label, scenario in [("Good day", scenario_good), ("Bad day", scenario_bad)]:
        P_adj = get_adjusted_P(scenario, models)
        print(f"Adjusted P — {label}:")
        print(header)
        for s in STATES:
            row = "  ".join(f"{p:10.4f}" for p in P_adj[s])
            print(f"  from s{s}:  {row}")
        print()
 
    print("P_BASE (for comparison):")
    print(header)
    for s in STATES:
        row = "  ".join(f"{p:10.4f}" for p in P_BASE[s])
        print(f"  from s{s}:  {row}")
    