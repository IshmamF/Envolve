import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="my_api_key",
)

# Replace placeholders like {{CITY_ORGANIZATIONS}} with real values,
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
                    "text": "You are an AI assistant for New York City's issue reporting system. Your task is to analyze reported issues, determine which city organization should handle them (if any), and create a brief call script for use with Hume AI.\n\nFirst, review the list of city organizations and their responsibilities:\n\n<city_organizations>\n{{CITY_ORGANIZATIONS}}\n</city_organizations>\n\nNow, examine the details of the reported issue:\n\n<issue_title>\n{{TITLE}}\n</issue_title>\n\n<issue_description>\n{{DESCRIPTION}}\n</issue_description>\n\n<issue_severity>\n{{SEVERITY}}\n</issue_severity>\n\n<issue_tags>\n{{TAGS}}\n</issue_tags>\n\n<issue_location>\n{{LOCATION}}\n</issue_location>\n\n<issue_photo_info>\n{{PHOTO_INFO}}\n</issue_photo_info>\n\nTo determine the appropriate action and create a call script, follow these steps:\n\n1. Summarize key details from each section of the issue report.\n2. List potential matching organizations and their relevant responsibilities.\n3. Evaluate the severity rating and its implications for immediate attention or reporting.\n4. Consider the photo information and its relevance to the issue.\n5. For each potential organization, list pros and cons for handling this issue.\n6. Determine if the issue is severe enough to warrant reporting.\n7. If the issue clearly matches one organization, select that organization.\n8. If multiple organizations could potentially handle the issue, choose NYC 311 Service.\n9. If the issue is minor, unclear, or doesn't require immediate attention, recommend no reporting.\n10. Based on your analysis, draft talking points for a brief call script for use with Hume AI.\n\nBefore providing your final recommendation and call script, wrap your detailed analysis inside <issue_analysis> tags. This analysis should follow the steps listed above and be thorough. It's okay for this section to be quite long.\n\nAfter your analysis, present your recommendation in a JSON format with the following structure:\n\n{\n  \"selectedOrganization\": \"Organization Name\",\n  \"organizationId\": \"ID number or null if no reporting necessary\",\n  \"justification\": \"Explanation for the recommendation\",\n  \"callScript\": \"Brief script for use with Hume AI\"\n}\n\nEnsure that your JSON response clearly distinguishes between cases where an organization is recommended and cases where no reporting is deemed necessary. The call script should be a concise set of talking points or questions based on the issue evaluation and recommendation."
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