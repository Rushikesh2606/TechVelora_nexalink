from fastapi import APIRouter, HTTPException, BackgroundTasks
from config.firebase_config import db
from datetime import datetime

router = APIRouter(prefix="/trust", tags=["trust"])

def get_badge(score: float) -> str:
    if score >= 80: return "HIGH_TRUST"
    if score >= 50: return "TRUSTED"
    if score >= 20: return "VERIFIED"
    return "NEW"

@router.post("/calculate/{uid}")
async def calculate_trust_score(uid: str, background_tasks: BackgroundTasks):
    try:
        user_ref = db.child(f'users/{uid}')
        userData = user_ref.get()
        
        if not userData:
            user_ref = db.child(f'companies/{uid}')
            userData = user_ref.get()
            if not userData:
                raise HTTPException(status_code=404, detail="User or Company not found")

        # Weighted Trust Signals (Total = 100)
        signals = {
            "profile_completeness": 0, 
            "email_verified": 0,       
            "connections": 0,          
            "activity": 0,             
            "evidence_provided": 0,    
            "endorsements": 0,         
            "skills_verified": 0,      
            "account_age": 0           
        }

        # 1. Profile Completeness (20%)
        fields = ['bio', 'headline', 'location', 'avatarUrl', 'description', 'website']
        completed_fields = sum(1 for f in fields if userData.get(f))
        signals["profile_completeness"] = min((completed_fields / 3) * 20, 20)

        # 2. Email Verification (10%)
        if userData.get('emailVerified'):
            signals["email_verified"] = 10

        # 3. Connections (20%)
        conn_count = userData.get('connectionsCount', 0)
        signals["connections"] = min((conn_count / 5) * 20, 20) 

        # 4. Activity (15%)
        post_count = userData.get('postsCount', 0)
        signals["activity"] = min((post_count / 1) * 15, 15) 
        
        # 5. Education/Skills setup (15%)
        has_edu = 1 if userData.get('education') else 0
        has_skills = 1 if userData.get('skills') else 0
        signals["evidence_provided"] = (has_edu * 7.5) + (has_skills * 7.5)

        # Account Age / Defaults
        signals["account_age"] = 5 # Stubbed

        # Calculate Total
        total_score = sum(signals.values())
        badge = get_badge(total_score)

        # Update RTDB
        user_ref.update({
            "trustScore": round(total_score, 2),
            "trustBadge": badge,
            "lastCalculated": datetime.now().isoformat()
        })

        return {
            "uid": uid,
            "score": round(total_score, 2),
            "badge": badge,
            "signals": signals
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
