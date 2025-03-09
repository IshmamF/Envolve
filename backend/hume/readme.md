# upload photo flow.

- add dotenv
- add .env key

## PHOTO:

- take the photo, and classification, get information about the photo, description, severity, and tags. - (photo_ai_gen.py)

- use that to create post

- after the 30th upvote,

# WHEN CALL READY:

- first determine organization + create script - (determine*org*&\_script.py)

- then pass info & do hume call

```orgs = []

if orgs.has(message.content.get('selectedOrganization')):

print(f"Organization {message.content.get('selectedOrganization')} is in the list")

call hume

create prompt for hume and pass info

and make request to hume

else:

print(f"Organization {message.content.get('selectedOrganization')} is not in the list")
```
