import modal
import os
import json
from typing import Optional, Dict, Any

# Create Modal image with all required packages
image = modal.Image.debian_slim().pip_install([
    "anthropic",  # Pin to a specific version
    "fastapi", 
    "python-multipart",
    "twilio"  # Add Twilio for Hume AI integration
])

# Create Modal app
app = modal.App("nyc-issue-analyzer-with-hume")

class IssueAnalyzer:
    def __init__(self):
        # Check for Anthropic API key
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            print("Warning: ANTHROPIC_API_KEY not found in environment variables")
            
        # Check for Twilio credentials
        self.twilio_account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        self.twilio_auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        self.twilio_phone_number = os.environ.get("TWILIO_PHONE_NUMBER")
        
        # Check for Hume AI credentials
        self.hume_config_id = os.environ.get("HUME_CONFIG_ID")
        self.hume_api_key = os.environ.get("HUME_API_KEY")
            
    @modal.method()
    async def analyze_issue(
        self,
        title: str,
        description: str,
        severity: str,
        tags: str,
        location: str,
        photo_info: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze an issue using Claude to determine which NYC city organization should handle it
        and generate a call script for Hume AI.
        """
        try:
            # Import here inside the method to avoid any Modal environment issues
            import anthropic
            
            if not self.api_key:
                return {
                    "error": "ANTHROPIC_API_KEY not configured",
                    "recommendation": {
                        "selectedOrganization": "NYC 311 Service",
                        "organizationId": 1,
                        "justification": "Default recommendation due to missing API key",
                        "callScript": f"Hello, I'd like to report an issue: {title}. The issue is located at: {location}."
                    }
                }
                
            # Initialize Anthropic client 
            client = anthropic.Anthropic(
            api_key=self.api_key,
            # Remove any auto-configured proxies
            )
            
            # Prepare the prompt with real values
            prompt = f"""You are an AI assistant for New York City's issue reporting system. Your task is to analyze reported issues, determine which city organization should handle them (if any), and create a brief call script for use with Hume AI.

First, review the list of city organizations and their responsibilities:

<city_organizations>
[{{
        "id": 1,
        "name": "NYC 311 Service", 
        "acronym": "311",
        "purpose": "Central point of contact for all non-emergency city services and complaints. Routes service requests to appropriate city departments.",
        "handles": [
            "Pothole reports",
            "Street light issues", 
            "Illegal dumping complaints",
            "Flooding/drainage problems",
            "Building violations",
            "All general service requests"
        ],
        "phone": "311"
    }},
    {{
        "id": 2,
        "name": "NYC Department of Transportation",
        "acronym": "DOT", 
        "purpose": "Maintains and enhances transportation infrastructure throughout the city.",
        "handles": [
            "Pothole repairs",
            "Street light maintenance and installation",
            "Street sign issues",
            "Roadway maintenance", 
            "Sidewalk repairs",
            "Traffic signals and controls"
        ],
        "phone": "311"
    }},
    {{
        "id": 3,
        "name": "NYC Department of Sanitation",
        "acronym": "DSNY",
        "purpose": "Manages waste collection, disposal, and cleaning operations for the city.",
        "handles": [
            "Illegal dumping investigation and cleanup",
            "Litter basket maintenance",
            "Street sweeping",
            "Bulk waste collection",
            "Snow removal",
            "Recycling programs"
        ],
        "phone": "311"
    }},
    {{
        "id": 4,
        "name": "NYC Department of Environmental Protection",
        "acronym": "DEP",
        "purpose": "Manages the city's water supply, water and sewer infrastructure, and environmental programs.",
        "handles": [
            "Catch basin and drain maintenance",
            "Flooding issues",
            "Water main breaks", 
            "Sewer backups",
            "Water quality monitoring"
        ],
        "phone": "311"
    }},
    {{
        "id": 5,
        "name": "NYC Department of Buildings",
        "acronym": "DOB",
        "purpose": "Ensures the safe and lawful use of buildings and properties through code enforcement.",
        "handles": [
            "Building violations",
            "Construction permits",
            "Building inspections",
            "Elevator issues",
            "Facade safety",
            "Construction site safety"
        ],
        "phone": "311"
    }}
]
</city_organizations>

Now, examine the details of the reported issue:

<issue_title>
{title}
</issue_title>

<issue_description>
{description}
</issue_description>

<issue_severity>
{severity}
</issue_severity>

<issue_tags>
{tags}
</issue_tags>

<issue_location>
{location}
</issue_location>

<issue_photo_info>
{photo_info or "No additional photo information available."}
</issue_photo_info>

To determine the appropriate action and create a call script, follow these steps:

1. Summarize key details from each section of the issue report.
2. List potential matching organizations and their relevant responsibilities.
3. Evaluate the severity rating and its implications for immediate attention or reporting.
4. Consider the photo information and its relevance to the issue.
5. For each potential organization, list pros and cons for handling this issue.
6. Determine if the issue is severe enough to warrant reporting.
7. If the issue clearly matches one organization, select that organization.
8. If multiple organizations could potentially handle the issue, choose NYC 311 Service.
9. If the issue is minor, unclear, or doesn't require immediate attention, recommend no reporting.
10. Based on your analysis, draft talking points for a brief call script for use with Hume AI.

Before providing your final recommendation and call script, wrap your detailed analysis inside <issue_analysis> tags. This analysis should follow the steps listed above and be thorough. It's okay for this section to be quite long.

After your analysis, present your recommendation in a JSON format with the following structure:

{{
  "selectedOrganization": "Organization Name",
  "organizationId": "ID number or null if no reporting necessary",
  "justification": "Explanation for the recommendation",
  "callScript": "Brief script for use with Hume AI"
}}

Ensure that your JSON response clearly distinguishes between cases where an organization is recommended and cases where no reporting is deemed necessary. The call script should be a concise set of talking points or questions based on the issue evaluation and recommendation."""
            
            # Call Claude API in the simplest way
            try:
                message = client.messages.create(
                    model="claude-3-haiku-20240307",  # Use available model
                    max_tokens=4095,
                    temperature=0.7,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                )
                
                # Extract response text
                response_text = message.content[0].text
            except Exception as e:
                print(f"Error calling Claude API: {e}")
                return {
                    "error": f"Claude API error: {str(e)}",
                    "recommendation": {
                        "selectedOrganization": "NYC 311 Service",
                        "organizationId": 1,
                        "justification": "Default recommendation due to API error",
                        "callScript": f"Hello, I'd like to report an issue: {title}. The issue is located at: {location}."
                    }
                }
            
            # Parse the analysis and recommendation sections
            full_analysis = ""
            recommendation = {}
            
            # Extract analysis section
            if "<issue_analysis>" in response_text and "</issue_analysis>" in response_text:
                analysis_start = response_text.find("<issue_analysis>") + len("<issue_analysis>")
                analysis_end = response_text.find("</issue_analysis>")
                full_analysis = response_text[analysis_start:analysis_end].strip()
            
            # Extract JSON recommendation
            try:
                # Find JSON block by looking for curly braces pattern
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    recommendation = json.loads(json_str)
            except Exception as e:
                print(f"Error parsing JSON recommendation: {e}")
                recommendation = {
                    "selectedOrganization": "NYC 311 Service",
                    "organizationId": 1,
                    "justification": "Default due to parsing error",
                    "callScript": f"Hello, I'd like to report an issue: {title}. The issue is located at: {location}."
                }
            
            # Return the complete response
            return {
                "analysis": full_analysis,
                "recommendation": recommendation,
                "raw_response": response_text
            }
            
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {
                "error": str(e),
                "recommendation": {
                    "selectedOrganization": "NYC 311 Service",
                    "organizationId": 1,
                    "justification": "Default recommendation due to unexpected error",
                    "callScript": f"Hello, I'd like to report an issue: {title}. The issue is located at: {location}."
                }
            }
    
    @modal.method()
    async def make_hume_call(self, to_number: str, call_script: str) -> Dict[str, Any]:
        """
        Make a call using Twilio and Hume AI with the generated call script
        """
        try:
            import twilio
            print(f"Twilio version: {twilio.__version__}")
            from twilio.rest import Client
            import urllib.parse
            # Debug environment variables - will show in Modal logs
            print("DEBUG: Environment variables:")
            print(f"TWILIO_ACCOUNT_SID exists: {bool(os.environ.get('TWILIO_ACCOUNT_SID'))}")
            print(f"TWILIO_AUTH_TOKEN exists: {bool(os.environ.get('TWILIO_AUTH_TOKEN'))}")
            print(f"TWILIO_PHONE_NUMBER exists: {bool(os.environ.get('TWILIO_PHONE_NUMBER'))}")
            
            # Debug instance variables
            print("DEBUG: Instance variables:")
            print(f"self.twilio_account_sid exists: {bool(self.twilio_account_sid)}")
            print(f"self.twilio_auth_token exists: {bool(self.twilio_auth_token)}")
            print(f"self.twilio_phone_number exists: {bool(self.twilio_phone_number)}")
            
            # Return more detailed error
            if not all([self.twilio_account_sid, self.twilio_auth_token, self.twilio_phone_number]):
                missing = []
                if not self.twilio_account_sid: missing.append("TWILIO_ACCOUNT_SID")
                if not self.twilio_auth_token: missing.append("TWILIO_AUTH_TOKEN")
                if not self.twilio_phone_number: missing.append("TWILIO_PHONE_NUMBER")
                return {
                    "error": f"Twilio credentials not configured. Missing: {', '.join(missing)}",
                    "status": "failed"
                }
                
            if not all([self.hume_config_id, self.hume_api_key]):
                return {
                    "error": "Hume AI credentials not configured",
                    "status": "failed"
                }
                
            # Initialize Twilio client
            client = Client(self.twilio_account_sid, self.twilio_auth_token)
        
            # Format the Hume AI webhook URL - BASE ONLY
            base_webhook_url = f"https://api.hume.ai/v0/evi/twilio"
            
            # Properly encode the parameters
            params = {
                "config_id": self.hume_config_id,
                "api_key": self.hume_api_key,
                "script": call_script  # This will get properly encoded
            }
            
            # Build the full URL with proper encoding
            query_string = urllib.parse.urlencode(params)
            webhook_url = f"{base_webhook_url}?{query_string}"
            
            print(f"Using webhook URL: {webhook_url}")
            
            # Make the call
            call = client.calls.create(
                to=to_number,
                from_=self.twilio_phone_number,
                url=webhook_url
            )
            
            return {
                "status": call.status,
                "call_sid": call.sid,
                "call_script": call_script
            }
            
        except Exception as e:
            print(f"Error making Hume AI call: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }

    @modal.method()
    async def analyze_and_call(
        self,
        title: str,
        description: str,
        severity: str,
        tags: str,
        location: str,
        to_number: str,
        photo_info: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Combined method to analyze an issue and immediately make a call with the results
        """
        # First analyze the issue
        analysis_result = await self.analyze_issue(
            title=title,
            description=description,
            severity=severity,
            tags=tags,
            location=location,
            photo_info=photo_info
        )
        
        # Extract the call script from the recommendation
        call_script = analysis_result.get("recommendation", {}).get(
            "callScript", 
            f"Hello, I'd like to report an issue: {title}. The issue is located at: {location}."
        )
        
        # Make the call using Hume AI
        call_result = await self.make_hume_call(
            to_number=to_number,
            call_script=call_script
        )
        
        # Return combined results
        return {
            "analysis": analysis_result,
            "call": call_result
        }

# Create FastAPI endpoint
@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("anthropic-secret"),
        modal.Secret.from_name("twilio-secret"),
        modal.Secret.from_name("hume-secret")
    ],
    timeout=120  # Increase timeout to 2 minutes to allow for API calls
)
@modal.asgi_app()
def api():
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from typing import Optional
    
    app = FastAPI(title="NYC Issue Analyzer with Hume AI Integration")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Define request models
    class IssueRequest(BaseModel):
        title: str
        description: str
        severity: str
        tags: str
        location: str
        photo_info: Optional[str] = None
    
    class CallRequest(BaseModel):
        to_number: str
        call_script: str
    
    class AnalyzeAndCallRequest(BaseModel):
        title: str
        description: str
        severity: str
        tags: str
        location: str
        to_number: str
        photo_info: Optional[str] = None
    
    # Endpoint for analyzing issues
    @app.post("/analyze")
    async def analyze_issue(issue: IssueRequest):
        analyzer = IssueAnalyzer()
        
        result = await analyzer.analyze_issue(
            title=issue.title,
            description=issue.description,
            severity=issue.severity,
            tags=issue.tags,
            location=issue.location,
            photo_info=issue.photo_info
        )
        
        if "error" in result and not "recommendation" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    
    # Endpoint for making Hume AI calls
    @app.post("/call")
    async def make_call(call_request: CallRequest):
        analyzer = IssueAnalyzer()
        
        result = await analyzer.make_hume_call(
            to_number=call_request.to_number,
            call_script=call_request.call_script
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    
    # Endpoint that combines analysis and calling
    @app.post("/analyze-and-call")
    async def analyze_and_call(request: AnalyzeAndCallRequest):
        analyzer = IssueAnalyzer()
        
        result = await analyzer.analyze_and_call(
            title=request.title,
            description=request.description,
            severity=request.severity,
            tags=request.tags,
            location=request.location,
            to_number=request.to_number,
            photo_info=request.photo_info
        )
        
        if "error" in result.get("analysis", {}) or "error" in result.get("call", {}):
            # Return the result anyway, but with a 500 status code
            return HTTPException(status_code=500, detail=result)
            
        return result
    
    @app.get("/")
    async def root():
        return {
            "message": "NYC Issue Analyzer with Hume AI Integration is running.",
            "endpoints": [
                "/analyze - Analyze an issue and get a recommendation",
                "/call - Make a call with Hume AI",
                "/analyze-and-call - Analyze an issue and immediately make a call"
            ]
        }
        
    return app