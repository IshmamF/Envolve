import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="my_api_key",
)

# Replace placeholders like {{PHOTO}} with real values,
# because the SDK does not support variables.
message = client.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=20000,
    temperature=1,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "You will be given a photo and a classification (which may be null) of the photo. Your task is to analyze the photo and provide information about it in a specific JSON format. Follow these steps:\n\n1. Examine the provided photo:\n<photo>\n{{PHOTO}}\n</photo>\n\n2. Consider the given classification (if available):\n<classification>\n{{CLASSIFICATION}}\n</classification>\n\n3. Analyze the photo and provide the following information in JSON format:\n\na. General information: Describe what you can tell about the photo, including key elements, setting, and any notable features.\n\nb. Environmental task: Provide a simple description of a potential environmental fix-up task related to the image. Focus on issues such as potholes, littering, flooding, broken street lights, or similar urban/environmental problems.\n\nc. Severity: Rate the urgency of the issue on a scale from 1 to 5, where 1 is least urgent and 5 is most urgent. Consider factors such as safety hazards, environmental impact, and inconvenience to the public.\n\nd. Tags: List 3-5 relevant tags that categorize the issue or elements in the photo.\n\nFormat your response in the following JSON structure:\n\n<answer>\n{\n  \"general_information\": \"Detailed description of the photo\",\n  \"environmental_task\": \"Simple description of the potential task\",\n  \"severity\": X,\n  \"tags\": [\"tag1\", \"tag2\", \"tag3\"]\n}\n</answer>\n\nEnsure that your analysis is based solely on the information provided in the photo and classification. If the classification is null or doesn't match what you see in the photo, rely on your own analysis of the image.\n\nRemember to be objective and focus on observable details. If you cannot determine certain aspects from the photo, it's acceptable to state that in your response."
                }
            ]
        }
    ]
)
print(message.content)