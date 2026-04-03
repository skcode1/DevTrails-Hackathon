# Weekly Income Insurance — Gig Worker Pricing Model

> A data-driven, fully personalised weekly premium pricing and fraud detection system for gig economy workers (ride-share, delivery, freelance). Built for the Guidewire Hackathon.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Model Architecture](#2-model-architecture)
3. [Layer 1 — Data Foundation](#3-layer-1--data-foundation)
4. [Layer 2 — Markov Chain](#4-layer-2--markov-chain)
5. [Layer 3 — Premium Pricing](#5-layer-3--premium-pricing)
6. [Layer 4 — Co-Insurance & Ruin Control](#6-layer-4--co-insurance--ruin-control)
7. [Layer 5 — Fraud Detection](#7-layer-5--fraud-detection)
8. [End-to-End Coherence](#8-end-to-end-coherence)
9. [Parameter Reference](#9-parameter-reference)
10. [Key Design Decisions](#10-key-design-decisions)

---

## 1. Overview

Gig workers have no fixed salary. Weekly income fluctuates due to platform disruptions, demand shocks, illness, weather, and policy changes. This model provides a **personalised weekly income insurance product** that:

- Prices the weekly premium fairly based on each rider's own recent earnings
- Controls insurer ruin risk via co-insurance and actuarial buffers
- Detects fraudulent claims using three independent statistical gates

**The single most important design property:** the fraud detection pipeline costs zero extra computation — it reuses `E[L]`, `σ_L`, and `π̄` already computed for pricing.

---

## 2. Model Architecture

```
Last 14 s₀ earnings records (per rider)
             │
             ▼
┌─────────────────────┐
│  Layer 1 — Data     │  μ̂ᵢ, σ̂ᵢ from 14 records → state boundaries → loss vector L
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Layer 2 — Markov   │  Dynamic P via softmax → week-averaged π̄
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Layer 3 — Premium  │  P = n·π̄·L·(1+λη) + z_α·σ_L + C
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Layer 4 — Co-ins   │  L^ins_k = ρ_k · max(0, L_k − d)
└─────────┬───────────┘
          │
          ▼
┌──────────────────────────────────────────────────┐
│  Layer 5 — Fraud                                 │
│  Claim (C_i, s_k) → Step 1 (Z̃) → Step 2 (Λ) → Decision  │
└──────────────────────────────────────────────────┘
```

---

## 3. Layer 1 — Data Foundation

### 3.1 The 14 s₀ Records

The entire model is built from one minimal data source: **the last 14 weeks in which the rider was in state s₀ (normal, undisrupted earnings)**.

From those 14 weekly average income observations `{X̄₁, X̄₂, ..., X̄₁₄}`, compute two sample statistics directly:

```
μ̂ᵢ  =  (1/14) Σ X̄_w          sample mean of recent normal earnings
σ̂ᵢ  =  std({ X̄_w })           sample standard deviation
```

No distribution is assumed. No fitting is run. These are the sample mean and standard deviation of 14 numbers — nothing more.

**Why exactly 14 records:**
14 records is the practical minimum for a reliable variance estimate. With roughly 60% of weeks being normal-state, 14 records appear within approximately 23 weeks of history — well inside a 6-month onboarding window. More records is always better, but 14 is sufficient and keeps the model responsive to recent changes.

**Why this captures recent working pattern:**
By taking the *most recent* 14 s₀ records, the estimates automatically track how the rider currently works. A rider who recently shifted from full-time to part-time will have lower recent `X̄_w` values — `μ̂ᵢ` drops, `σ̂ᵢ` adjusts, and the loss vector and premium update to match their actual current exposure. There is no stale historical average problem.

### 3.2 Why s₀ Records Only

Disrupted weeks have systematically lower income by definition. Including them in the variance estimate does two things, both wrong:

1. **Inflates `σ̂ᵢ`** — pulling the sample mean down and the variance up
2. **Widens state boundaries** — making disruptions harder to detect and understating their severity

The s₀ variance is the variance of the income-generating process in its **undisrupted state** — the natural baseline for measuring how far a disrupted week deviates from normal. That is the right denominator.

### 3.3 State Boundaries

Four disruption states defined as income intervals, anchored to `μ̂ᵢ` and `σ̂ᵢ`:

| State | Income interval | Interpretation |
|---|---|---|
| s₀ Normal | `X̄_w ≥ μ̂ − 0.5σ̂` | Near or above baseline |
| s₁ Mild | `μ̂ − 1.5σ̂  ≤  X̄_w  <  μ̂ − 0.5σ̂` | Noticeably below baseline |
| s₂ Major | `μ̂ − 2.5σ̂  ≤  X̄_w  <  μ̂ − 1.5σ̂` | Significantly below baseline |
| s₃ Severe | `X̄_w  <  μ̂ − 2.5σ̂` | Extreme loss week |

The boundaries are symmetric σ-multiples around `μ̂ᵢ`, making the interval widths uniform at exactly `σ̂ᵢ` each.

### 3.4 Loss Vector

The loss in state `k` is the expected income shortfall relative to the normal-state baseline `μ̂ᵢ`. The representative income in each state is the midpoint of its interval:

| State | Interval | Midpoint income | Loss `L_k` |
|---|---|---|---|
| s₀ | `[μ̂ − 0.5σ̂, ∞)` | `μ̂` (no disruption) | `0` |
| s₁ | `[μ̂ − 1.5σ̂, μ̂ − 0.5σ̂)` | `μ̂ − σ̂` | `σ̂ᵢ` |
| s₂ | `[μ̂ − 2.5σ̂, μ̂ − 1.5σ̂)` | `μ̂ − 2σ̂` | `2σ̂ᵢ` |
| s₃ | `(−∞, μ̂ − 2.5σ̂)` | `μ̂ − 3σ̂` (representative) | `3σ̂ᵢ` |

This gives a clean, fully distribution-free loss vector:

```
L  =  σ̂ᵢ · [0,  1,  2,  3]
```

**The loss vector directly reflects the rider's recent working pattern** because `σ̂ᵢ` comes from their last 14 normal-state weeks. A volatile rider with large weekly income swings has a larger `σ̂ᵢ`, larger losses in each state, and a higher premium. A stable rider has smaller losses and a lower premium. This is actuarially correct — more volatile income means larger expected disruption losses.

**Empirical refinement:** if sufficient historical data exists in each state, the midpoint can be replaced with the empirical mean of observed incomes in that state, giving an even more data-driven loss vector.

---

## 4. Layer 2 — Markov Chain

### 4.1 State Space

The worker's disruption level evolves daily as a discrete-time Markov chain over `S = {s₀, s₁, s₂, s₃}`. Disruptions have day-to-day persistence captured by diagonal dominance of `P`, but not long memory beyond that.

### 4.2 Transition Matrix P

`P` is dynamically generated rather than fixed:

**Base P** from historical transition counts (MLE):
```
P̂_ij  =  count(sₜ = i,  sₜ₊₁ = j) / count(sₜ = i)
```

**ML adjustment** via softmax on a risk index vector `r(t)`:
```
P_ij(t)  =  exp(α · r_ij(t)) / Σ_k exp(α · r_ik(t))
```

`α` is the sharpness parameter. High `α` gives decisive transitions; low `α` gives a more uncertain model.

**Properties:** `P_ij ≥ 0`, `Σ_j P_ij = 1` for all `i`. Diagonal entries are large — disruptions persist day to day.

### 4.3 Week-Averaged Distribution π̄

> **Key insight: use π̄, not π₇.**

The day-7 snapshot `π₇ = π₀P⁷` only sees where the rider ends up, missing disruptions that occurred mid-week and resolved. A rider disrupted on day 2 who recovers by day 7 gets a near-zero premium under `π₇` — but they suffered a real loss on day 2.

By linearity of expectation, the true expected weekly loss is:

```
E[weekly loss]  =  Σ_t E[L_t]  =  Σ_t π_t · L  =  n · π̄ · L
```

The week-average correctly prices cumulative disruption across all working days.

**Closed form** (matrix geometric series):
```
π̄  =  (1/n) · π₀ · P · (I − Pⁿ)(I − P)⁻¹
```

where `n` = working days in the week (3–7).

### 4.4 Stationary Distribution π∞

```
π∞  =  lim_{n→∞} π₀ · Pⁿ
Solve:  π∞ · P = π∞,    Σ_k π∞_k = 1
```

Used as the base rate in the fraud likelihood ratio test (Layer 5).

---

## 5. Layer 3 — Premium Pricing

### 5.1 The Formula

```
P_weekly  =  n · π̄ · L^ins · (1 + λη)   +   VaR_α   +   C
              ─────────────────────────        ─────       ─
              pure premium + entropy adj       VaR margin  opex
```

### 5.2 Component 1 — Pure Premium

```
E[weekly insured loss]  =  n · Σ_k π̄_k · L^ins_k
```

The actuarially fair floor. Charging less than this guarantees long-run losses.

### 5.3 Component 2 — VaR Margin

The insured loss distribution has exactly 4 outcomes — `L^ins_0, L^ins_1, L^ins_2, L^ins_3` — with probabilities `π̄_0, π̄_1, π̄_2, π̄_3`. The exact VaR at confidence level α is read directly from this PMF; no normal approximation is needed or appropriate.

**Algorithm** (sort outcomes ascending, accumulate probability until α is exceeded):

```
Sort states by L^ins_k ascending: k = 0, 1, 2, 3

Accumulate CDF:
  F_0  =  π̄_0
  F_1  =  π̄_0 + π̄_1
  F_2  =  π̄_0 + π̄_1 + π̄_2
  F_3  =  1.0

VaR_α  =  L^ins_k   where k = min{ j : F_j ≥ α }
```

Because `L^ins` is already weakly ordered `0 ≤ L^ins_1 ≤ L^ins_2 ≤ L^ins_3`, the sort is trivial. The VaR resolves to one of at most 4 possible values:

| α threshold | VaR_α |
|---|---|
| α ≤ π̄_0 | `0` (s₀ absorbs it) |
| π̄_0 < α ≤ π̄_0 + π̄_1 | `L^ins_1` |
| π̄_0 + π̄_1 < α ≤ π̄_0 + π̄_1 + π̄_2 | `L^ins_2` |
| α > π̄_0 + π̄_1 + π̄_2 | `L^ins_3` |

**Why not `z_α · σ_L^ins`:** that formula is exact only when the loss distribution is normal. With 4 discrete outcomes the normal approximation overstates VaR when probability mass is concentrated in s₀ (heavy left skew) and understates it when severe-state probability is elevated. The exact PMF VaR has zero approximation error and is simpler to compute — no standard deviation calculation required.

### 5.4 Component 3 — Entropy Loading

When the Markov model is uncertain (π̄ spread nearly uniformly across states), the premium rises automatically:

```
H(π̄)  =  −Σ_k π̄_k · log₂(π̄_k)        [Shannon entropy]
η      =  H(π̄) / log₂(4)               [normalised 0→1]
Load   =  λ · η · n · π̄ · L^ins
```

- `η = 0`: model confident → no extra loading
- `η = 1`: fully uncertain → `+λ × 100%` surcharge
- `λ` is a tunable sensitivity parameter

### 5.5 Component 4 — Operational Cost

Fixed per-rider per-week platform cost `C` for claims processing, technology, and support.

---

## 6. Layer 4 — Co-Insurance & Ruin Control

### 6.1 The Problem

`L₃ = 3σ̂ᵢ` is substantially larger than `L₂ = 2σ̂ᵢ`. Even at `π̄₃ = 5%`, the severe state can dominate the premium. Worse, severe disruptions are **correlated across riders** — a platform outage or city-wide event hits many riders simultaneously. Aggregate payout variance explodes, threatening insurer solvency. Co-insurance directly controls the maximum payout per claim, capping the insurer's exposure at each severity level.

### 6.2 Co-Insurance Structure

The rider absorbs deductible `d` first, then the insurer covers fraction `ρ_k` of the remainder:

```
L^ins_k  =  ρ_k · max(0,  L_k − d)        [insurer pays]
L^ret_k  =  d + (1−ρ_k) · max(0, L_k−d)   [rider retains]
```

**ρ_k increases monotonically with severity:**

| State | ρ_k | Rationale |
|---|---|---|
| s₀ | 0.00 | Normal state — product does not activate |
| s₁ | 0.30 | Mild — rider can absorb most of it |
| s₂ | 0.65 | Major — insurer takes majority |
| s₃ | 1.00 | Severe — insurer covers all above deductible |



---

## 7. Layer 5 — Fraud Detection

Every claim makes two independent assertions: *"I was in state s_k this week"* and *"my loss was C_i rupees."* Each can be fraudulent independently. Two sequential steps test them.

### 7.1 Pipeline

```
Claim arrives (C_i, state s_k)
         │
         ▼
  ┌──────────────────────────────────────────────────┐
  │ Step 1 — Modified Z̃                state-blind  │
  │ Is the claimed amount anomalous for this rider?  │
  │ Z̃ > 3.5 → FLAG (amount inflation)               │
  └──────────────────────┬───────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────┐
  │ Step 2 — Markov Λ                 amount-blind   │
  │ Is the claimed state plausible given π̄?          │
  │ Λ_k < 0.3 → FLAG (state fabrication)            │
  └──────────────────────┬───────────────────────────┘
                         │
                         ▼
                     Decision
```

### 7.2 Step 1 — Modified Z̃ (Amount Test, State-Blind)

The loss vector `L` is a 4-point discrete PMF. The standard Z-test is inappropriate because the PMF is discrete and skewed — when `π̄₀` is large, the mean `E[L]` is pulled near zero while `σ_L` is inflated by the large `L₃`, causing the standard Z-test to systematically miss fraud in normal-week riders.

**Modified Z-score** (Iglewicz & Hoaglin) uses the median and MAD — robust to any discrete distribution:

```
L̃    =  weighted median of {L^ins_k} under π̄
MAD  =  weighted median of {|L^ins_k − L̃|} under π̄
Z̃    =  0.6745 · (C_i − L̃) / MAD
```

`0.6745` is a scale-consistency constant. Threshold is **3.5** because the 4-point discrete distribution has no smooth tails.

| Z̃ | Decision | Adjuster action |
|---|---|---|
| Z̃ > 3.5 | **FLAG** | Request financial documentation |
| 2.5 < Z̃ ≤ 3.5 | Review | Request supporting evidence |
| Z̃ ≤ 2.5 | Pass | Approve |

**Catches:** amount inflation — a rider in a legitimately disrupted state who overstates the rupee value of their claim.

### 7.3 Step 2 — Markov Λ (State Test, Amount-Blind)

Catches what Step 1 completely misses: a rider who had a normal week but claims a disrupted state with a perfectly reasonable amount for that state.

```
Λ_k  =  π̄_k / π∞_k
```

- `Λ_k ≥ 1`: rider is at or above the base rate for state s_k → plausible
- `Λ_k < 0.3`: rider is less than 30% as likely as average to be in s_k → **FLAG**

| Λ_k | Decision | Adjuster action |
|---|---|---|
| Λ_k < 0.30 | **FLAG** | Request platform activity logs (trips, hours, GPS) |
| 0.30 ≤ Λ_k < 0.70 | Review | Request supporting evidence |
| Λ_k ≥ 0.70 | Pass | Approve |

**Catches:** state fabrication — a rider whose Markov trajectory indicates a predominantly normal week claiming a high-disruption state.

### 7.4 Decision Matrix

| | Amount OK (Z̃ ≤ 3.5) | Amount suspicious (Z̃ > 3.5) |
|---|---|---|
| **State plausible (Λ ≥ 0.3)** | Approve | Flag — financial docs |
| **State implausible (Λ < 0.3)** | Flag — activity logs | Flag — both signals |

### 7.5 Why Sequential, Not Blended

Each step maps to a different adjuster action:

- **Step 1** → financial anomaly → bank statements, platform earnings records
- **Step 2** → behavioural anomaly → app activity logs, trip counts, GPS data

Two independent evidentiary threads are more defensible in claims adjudication than one composite number. A blended score loses the diagnostic signal of which dimension — amount or state — triggered the flag.

---

## 8. End-to-End Coherence

### 8.1 Single data source drives everything

`μ̂ᵢ` and `σ̂ᵢ` from 14 s₀ records are the only raw inputs per rider. Every downstream quantity is a deterministic function of these two numbers plus the Markov distribution `π̄`:

```
μ̂ᵢ, σ̂ᵢ  →  state boundaries {b₀, b₁, b₂}
          →  L = σ̂ᵢ · [0, 1, 2, 3]
          →  L^ins  (after co-insurance ρ_k, deductible d)
          →  E[L^ins], σ_L^ins  (premium components)
          →  L̃, MAD  (fraud Z̃ thresholds)

π̄        →  entropy η  (premium loading)
          →  Λ_k = π̄_k / π∞_k  (fraud state test)
```

Change the rider's recent earnings history and the entire model updates automatically.

### 8.2 Fraud detection is free

| Step | Quantities used | Already computed in |
|---|---|---|
| Step 1 Z̃ | `L̃`, `MAD` from `L^ins` | Layer 3 |
| Step 2 Λ | `π̄_k`, `π∞_k` | Layer 2 |

Total additional cost at claim time: one division.

### 8.3 What remains population-level

| Quantity | Why population-level |
|---|---|
| Cold start prior | New riders with insufficient s₀ history use regional `μ̂_reg`, `σ̂_reg` |
| Markov matrix P | No individual rider generates enough state transitions to estimate a 4×4 matrix |
| Stationary distribution π∞ | Base rate for fraud Λ is a population question, not personal |

---

## 9. Parameter Reference

| Parameter | Symbol | Typical value | Set by |
|---|---|---|---|
| s₀ records | n | 14 | Design choice |
| Working days per week | n_w | 5 | Operational |
| VaR confidence level | α | 0.95 | Actuarial policy |
| Entropy sensitivity | λ | 0.3 | Tunable |
| Co-insurance ratios | ρ_k | [0, 0.30, 0.65, 1.00] | Product design |
| Deductible | d | ~5% of L₁ | Product design |
| Softmax sharpness | α_P | 2.0 | ML tuning |
| Z̃ flag threshold | — | 3.5 | Iglewicz-Hoaglin |
| Z̃ review threshold | — | 2.5 | Iglewicz-Hoaglin |
| Λ flag threshold | — | 0.30 | Likelihood ratio |
| Λ review threshold | — | 0.70 | Likelihood ratio |
| Cold start minimum | — | 30 days | Statistical minimum |

---

## 10. Key Design Decisions

**14 s₀ records — no distributional assumption**
The mean and variance are computed directly from 14 observations. No distribution is fitted or assumed on the earnings data. The loss vector `L = σ̂ᵢ · [0, 1, 2, 3]` follows from σ-interval midpoints — a purely arithmetic definition.

**Most recent 14, not a fixed window**
Using the latest s₀ records means the model tracks the rider's current working pattern. A recent shift from full-time to part-time is automatically reflected in `μ̂ᵢ` and `σ̂ᵢ` without any manual update.

**s₀ records only**
The undisrupted baseline variance is the correct scale for measuring disruption. Including disrupted weeks inflates `σ̂ᵢ`, widens state boundaries, and understates how severe disruptions actually are.

**π̄ not π₇**
Week-average prices cumulative disruption correctly by linearity of expectation. The day-7 snapshot misses mid-week disruptions that resolved.

**Modified Z̃ not standard Z**
`L` is a 4-point discrete PMF. The heavy `L₃` entry inflates `σ_L`, causing standard Z to miss fraud in riders with high normal-state probability. MAD is robust to this.

**Two sequential steps not a blended score**
Two different failure modes require two different follow-up actions. Sequential steps preserve diagnostic signal and are more defensible in claims adjudication.

**Exact PMF VaR, not normal approximation**
The insured loss distribution has 4 outcomes. The exact VaR at confidence α is the smallest `L^ins_k` whose cumulative probability meets or exceeds α — a single CDF lookup. The previous `z_α · σ_L^ins` formula assumes normality, which is incorrect for a 4-point discrete PMF and produces systematic errors at the tails. The exact approach has zero approximation error and requires no standard deviation calculation.

**Co-insurance on the severe state**
`L₃ = 3σ̂ᵢ` can dominate the premium even at low `π̄₃`. Co-insurance caps the insurer's maximum payout per claim, directly controlling exposure to correlated severe-state events across many riders.

---

*Model developed for the Guidewire Hackathon.*
