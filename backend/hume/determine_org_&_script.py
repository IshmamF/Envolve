import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="my_api_key",
)

# Replace placeholders like {{title}} {{description}} {{severity}} {{tags}} {{location}} {{photo_info}} with real values,
# because the SDK does not support variables.
message = client.messages.create(
    model="claude-3-5-haiku-20241022",
    max_tokens=8192,
    temperature=1,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """You are an AI assistant for New York City's issue reporting system. Your task is to analyze reported issues, determine which city organization should handle them (if any), and create a brief call script for use with Hume AI.

First, review the list of city organizations and their responsibilities:

<city_organizations>
[{
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    }
]}
</city_organizations>

Now, examine the details of the reported issue:

<issue_title>
{{TITLE}}
</issue_title>

<issue_description>
{{DESCRIPTION}}
</issue_description>

<issue_severity>
{{SEVERITY}}
</issue_severity>

<issue_tags>
{{TAGS}}
</issue_tags>

<issue_location>
{{LOCATION}}
</issue_location>

<issue_photo_info>
{{PHOTO_INFO}}
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

{
  "selectedOrganization": "Organization Name",
  "organizationId": "ID number or null if no reporting necessary",
  "justification": "Explanation for the recommendation",
  "callScript": "Brief script for use with Hume AI"
}

Ensure that your JSON response clearly distinguishes between cases where an organization is recommended and cases where no reporting is deemed necessary. The call script should be a concise set of talking points or questions based on the issue evaluation and recommendation.""".format(hello)
                }
            ]
        },
        {
            "role": "assistant",
            "content": [
                {
                    "type": "text",
                    "text": "<issue_analysis>"
                }
            ]
        }
    ]
)
print(message.content)