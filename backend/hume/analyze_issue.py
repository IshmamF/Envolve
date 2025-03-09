import modal
import os
import json
import anthropic
from typing import Optional, Dict, Any

# Create Modal image with Anthropic SDK
image = modal.Image.debian_slim().pip_install(["anthropic>=0.18.0", "fastapi", "python-multipart"])

# Create Modal app
app = modal.App("nyc-issue-analyzer")

class IssueAnalyzer:
    def __init__(self):
        # Check for Anthropic API key
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            print("Warning: ANTHROPIC_API_KEY not found in environment variables")
            
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
        client = anthropic.Anthropic(api_key=self.api_key)
        
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
        
        try:
            # Call Claude API with synchronous handling
            try:
                message = client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=8192,
                    temperature=0.7,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                )
                
                # Extract response text (new style API)
                response_text = message.content[0].text
            except Exception as e:
                print(f"Error with new API format: {e}")
                # Try legacy API format as fallback
                try:
                    message = client.completions.create(
                        model="claude-3-5-haiku-20241022",
                        max_tokens=8192,
                        temperature=0.7,
                        prompt=f"\n\nHuman: {prompt}\n\nAssistant:",
                    )
                    response_text = message.completion
                except Exception as e2:
                    print(f"Error with legacy API format: {e2}")
                    raise Exception(f"Failed to call Claude API: {e} | {e2}")
            
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
            print(f"Error calling Claude API: {e}")
            return {
                "error": str(e),
                "recommendation": {
                    "selectedOrganization": "NYC 311 Service",
                    "organizationId": 1,
                    "justification": "Default recommendation due to API error",
                    "callScript": f"Hello, I'd like to report an issue: {title}. The issue is located at: {location}."
                }
            }

# Create FastAPI endpoint
@app.function(
    image=image,
    secrets=[modal.Secret.from_name("anthropic-secret")]
)
@modal.asgi_app()
def api():
    from fastapi import FastAPI, HTTPException, Body
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from typing import Optional
    
    app = FastAPI(title="NYC Issue Analyzer API")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Define request model
    class IssueRequest(BaseModel):
        title: str
        description: str
        severity: str
        tags: str
        location: str
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
    
    @app.get("/")
    async def root():
        return {"message": "NYC Issue Analyzer API is running. Post to /analyze to analyze an issue."}
        
    return app