import os
import json
import requests
from twilio.rest import Client
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
import uvicorn
from typing import Dict, List, Optional

load_dotenv()

app = FastAPI()

HUME_API_KEY = os.getenv("HUME_API_KEY")
HUME_CONFIG_ID = os.getenv("HUME_CONFIG_ID")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
TARGET_PHONE_NUMBER = os.getenv("TARGET_PHONE_NUMBER")
WEBHOOK_BASE_URL = os.getenv("WEBHOOK_BASE_URL")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

class PlasticWasteReport(BaseModel):
    location: str
    waste_type: str
    quantity: str
    hazard_level: str
    date_observed: str
    reporter_name: str
    reporter_contact: str
    additional_notes: Optional[str] = None

SAMPLE_REPORT = PlasticWasteReport(
    location="Corner of Broadway and West 86th Street, Manhattan, NY",
    waste_type="Plastic bags and packaging materials",
    quantity="Approximately 2 garbage bags worth",
    hazard_level="Medium - blocking part of sidewalk and storm drain",
    date_observed="March 8, 2025, around 10:30 AM",
    reporter_name="John Doe",
    reporter_contact="john.doe@example.com",
    additional_notes="The plastic appears to have come from a nearby store. Some pieces are beginning to enter the storm drain."
)

call_records = {}

def create_hume_config():
    url = "https://api.hume.ai/v0/evi/configs"
    
    config_data = {
        "name": "NY 311 Plastic Waste Reporter",
        "description": "AI assistant for reporting plastic waste issues to NY 311",
        "system_prompt": f"""
        You are an AI assistant calling NY 311 to report plastic waste. You are calling on behalf of a concerned citizen.
        
        Here are details about the plastic waste issue:
        - Location: {SAMPLE_REPORT.location}
        - Type of plastic waste: {SAMPLE_REPORT.waste_type}
        - Quantity: {SAMPLE_REPORT.quantity}
        - Hazard level: {SAMPLE_REPORT.hazard_level}
        - When observed: {SAMPLE_REPORT.date_observed}
        - Reporter: {SAMPLE_REPORT.reporter_name} (Contact: {SAMPLE_REPORT.reporter_contact})
        
        Additional information: {SAMPLE_REPORT.additional_notes}
        
        Your goals for this call:
        1. Clearly identify yourself as an AI assistant calling on behalf of the reporter.
        2. Provide all relevant details about the plastic waste issue.
        3. Answer questions using ONLY the information provided above.
        4. If asked for information you don't have, politely state that you only have the details listed above.
        5. Request a reference or case number for the report.
        6. Thank the operator for their assistance.
        
        Keep your responses concise and focused on the reporting task. Remain polite and professional throughout the call.
        """,
        "voice": {
            "provider": "eleven_labs",
            "voice_id": "Rachel",
            "settings": {
                "stability": 0.7,
                "similarity_boost": 0.75
            }
        },
        "on_call_start": {
            "greeting": "Hello, I'm an AI assistant calling on behalf of a concerned citizen to report a plastic waste issue in New York City. I'd like to file a report with 311."
        },
        "on_call_end": {
            "farewell": "Thank you for your assistance with this report. Have a good day."
        },
        "emotions_to_track": ["confusion", "frustration", "satisfaction"],
        "call_summary": True
    }
    
    headers = {
        "Authorization": f"Bearer {HUME_API_KEY}",
        "Content-Type": "application/json"
    }
    
    if HUME_CONFIG_ID:
        response = requests.put(
            f"{url}/{HUME_CONFIG_ID}",
            headers=headers,
            json=config_data
        )
    else:
        response = requests.post(
            url,
            headers=headers,
            json=config_data
        )
    
    if response.status_code in (200, 201):
        config = response.json()
        return config["id"]
    else:
        raise Exception(f"Failed to create/update Hume config: {response.text}")

def initiate_outbound_call():
    config_id = HUME_CONFIG_ID or create_hume_config()
    
    hume_webhook = f"https://api.hume.ai/v0/evi/twilio?config_id={config_id}&api_key={HUME_API_KEY}"
    
    status_callback = f"{WEBHOOK_BASE_URL}/call-status"
    
    call = twilio_client.calls.create(
        to=TARGET_PHONE_NUMBER,
        from_=TWILIO_PHONE_NUMBER,
        url=hume_webhook,
        status_callback=status_callback,
        status_callback_event=['completed'],
        status_callback_method='POST'
    )
    
    call_records[call.sid] = {
        "status": call.status,
        "report_data": SAMPLE_REPORT.dict(),
        "start_time": call.start_time,
        "summary": None
    }
    
    return call.sid

@app.post("/initiate-call")
async def api_initiate_call():
    try:
        call_sid = initiate_outbound_call()
        return {"status": "success", "call_sid": call_sid, "message": "Call initiated"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/call-status")
async def call_status_webhook(request: Request):
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status = form_data.get("CallStatus")
    
    if call_sid in call_records:
        call_records[call_sid]["status"] = call_status
        
        if call_status == "completed":
            try:
                headers = {"Authorization": f"Bearer {HUME_API_KEY}"}
                response = requests.get(
                    f"https://api.hume.ai/v0/evi/calls/{call_sid}/summary",
                    headers=headers
                )
                
                if response.status_code == 200:
                    summary_data = response.json()
                    call_records[call_sid]["summary"] = summary_data
            except Exception as e:
                print(f"Error fetching call summary: {str(e)}")
    
    return Response(status_code=200)

@app.get("/calls/{call_sid}")
async def get_call_details(call_sid: str):
    if call_sid in call_records:
        return call_records[call_sid]
    return {"status": "error", "message": "Call not found"}

@app.get("/calls")
async def get_all_calls():
    return call_records

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Hume AI 311 Caller")
    parser.add_argument("--action", choices=["config", "call", "serve"], 
                        help="Action to perform: create config, make call, or start server")
    
    args = parser.parse_args()
    
    if args.action == "config":
        config_id = create_hume_config()
        print(f"Created/updated Hume EVI config: {config_id}")
    elif args.action == "call":
        call_sid = initiate_outbound_call()
        print(f"Initiated call with SID: {call_sid}")
    elif args.action == "serve":
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        print("Please specify an action: --action [config|call|serve]")