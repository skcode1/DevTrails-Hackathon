from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,Field
import numpy as np  

from markov_lr import generate_synthetic_data,train_models
from models import run_engine,fraud_check
from default_payload import pricing_request_template, S0_RECORD_COUNT, ui_defaults

from fastapi.middleware.cors import CORSMiddleware



lr_models={}

app=FastAPI(
    title="Weekly Income Insurance — Pricing Engine",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    print("Training Markov models...")
    data=generate_synthetic_data(n_riders=400,n_days=120)
    lr_models["models"]=train_models(data)
    print("Models ready.")

class RiderFeatures(BaseModel):
    earnings_velocity_5d:  float = Field(..., description="Slope of last-5-day earnings vs baseline")
    days_since_last_s0:    float = Field(..., description="Consecutive days outside normal state")
    earnings_ratio_to_mu:  float = Field(..., description="Today's earnings / rider's mu")
    active_hours_today:    float = Field(..., description="Hours logged on platform today")
    trips_completed_today: float = Field(..., description="Completed jobs today")
    cancellation_rate_7d:  float = Field(..., description="Rolling 7-day cancellation rate (0-1)")
    day_of_week:           int   = Field(..., ge=0, le=6,   description="0=Mon, 6=Sun")
    is_holiday:            int   = Field(..., ge=0, le=1,   description="Binary holiday flag")
    weather_severity:      float = Field(..., ge=0.0, le=1.0, description="0-1 normalised")
    surge_active:          int   = Field(..., ge=0, le=1,   description="Binary surge flag")

class PriceRequest(BaseModel):
    rider_id:str
    s0_earnings:    list[float] = Field(..., min_length=14, max_length=14,
                                        description="Last 14 s0 daily earnings (₹)")
    features_today: RiderFeatures
    current_state:  int   = Field(..., ge=0, le=3, description="0=normal … 3=severe")
    n_working_days: int   = Field(5,    ge=1, le=7)
    lam:            float = Field(0.3,  description="Entropy loading sensitivity")
    alpha:          float = Field(0.95, description="VaR confidence level")
    opex:           float = Field(50.0, description="Fixed platform cost (₹)")
    deductible_pct: float = Field(0.05, description="Deductible as fraction of L1")
    rho:            list[float] = Field([0.0, 0.3, 0.65, 1.0],
                                        description="Co-insurance ratios per state")   

class FraudRequest(PriceRequest):
    claim_amount:  float = Field(..., gt=0, description="Claimed loss (₹)")
    claimed_state: int   = Field(..., ge=0, le=3, description="State the rider claims")


class PriceResponse(BaseModel):
    rider_id:     str
    mu:           float
    sigma:        float
    L:            list[float]
    L_ins:        list[float]
    pi_bar:       list[float]
    pi_inf:       list[float]
    P_adjusted:   list[list[float]]
    premium:      float
    pure_premium: float
    entropy_load: float
    entropy_eta:  float
    VaR:          float
    opex:         float  

class FraudResponse(BaseModel):
    rider_id:        str
    claim_amount:    float
    claimed_state:   int
    Z_tilde:         float
    amount_decision: str
    amount_action:   str
    Lambda:          float
    state_decision:  str
    state_action:    str
    overall:         str  

class PriceAndFraudResponse(PriceResponse):
    fraud: FraudResponse  

def _get_models():
    if "models" not in lr_models:
        raise HTTPException(status_code=503,detail="Models not ready")
    return lr_models["models"]

@app.get("/")
def root():
    """No HTML UI here — use the EquiScale Vite app (e.g. :5173) or OpenAPI docs."""
    return {
        "service": app.title,
        "version": app.version,
        "docs": "/docs",
        "openapi_json": "/openapi.json",
        "get": ["/", "/health", "/pricing-defaults"],
        "post": ["/price", "/fraud", "/price-and-fraud"],
    }

@app.get("/pricing-defaults")
def pricing_defaults():
    """Body template for POST /price (excluding s0_earnings) plus UI hints."""
    return {
        "template": pricing_request_template(),
        "s0_record_count": S0_RECORD_COUNT,
        "ui": ui_defaults(),
    }

@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": "models" in lr_models}

@app.post("/price",response_model=PriceResponse)
def price(req:PriceRequest):
    engine=run_engine(
        s0_earnings    = req.s0_earnings,
        features_today = req.features_today.model_dump(),
        current_state  = req.current_state,
        lr_models      = _get_models(),
        n              = req.n_working_days,
        lam            = req.lam,
        alpha          = req.alpha,
        C              = req.opex,
        deductible_pct = req.deductible_pct,
        rho            = req.rho, 
    ) 
    return PriceResponse(rider_id=req.rider_id,**{
        k: v for k, v in engine.items() if not k.startswith("_")
    })

@app.post("/fraud",response_model=FraudResponse)
def fraud(req:FraudRequest):
    engine=run_engine(
        s0_earnings    = req.s0_earnings,
        features_today = req.features_today.model_dump(),
        current_state  = req.current_state,
        lr_models      = _get_models(),
        deductible_pct = req.deductible_pct,
        rho            = req.rho,       
    )
    result=fraud_check(
        claim_amount=req.claim_amount,
        claimed_state=req.claimed_state,
        pi_bar         = engine["_pi_bar_arr"],
        pi_inf         = engine["_pi_inf_arr"],
        L_ins          = engine["_L_ins_arr"],
    )
    return FraudResponse(
        rider_id      = req.rider_id,
        claim_amount  = req.claim_amount,
        claimed_state = req.claimed_state,
        **result,
    )

@app.post("/price-and-fraud",response_model=PriceAndFraudResponse)
def price_and_fraud(req:FraudRequest):
    engine = run_engine(
        s0_earnings    = req.s0_earnings,
        features_today = req.features_today.model_dump(),
        current_state  = req.current_state,
        lr_models      = _get_models(),
        n              = req.n_working_days,
        lam            = req.lam,
        alpha          = req.alpha,
        C              = req.opex,
        deductible_pct = req.deductible_pct,
        rho            = req.rho,
    )
    fraud_result = fraud_check(
        claim_amount   = req.claim_amount,
        claimed_state  = req.claimed_state,
        pi_bar         = engine["_pi_bar_arr"],
        pi_inf         = engine["_pi_inf_arr"],
        L_ins          = engine["_L_ins_arr"],
    )
    return PriceAndFraudResponse(
        rider_id = req.rider_id,
        **{k: v for k, v in engine.items() if not k.startswith("_")},
        fraud = FraudResponse(
            rider_id      = req.rider_id,
            claim_amount  = req.claim_amount,
            claimed_state = req.claimed_state,
            **fraud_result,
        ),
    )