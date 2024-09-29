# Anki MD

A tool to convert markdown files to Anki notes and cards.

## Creating a note

```shell
curl localhost:8765 -X POST -d '{
    "action": "addNote",
    "version": 6,
    "params": {
        "note": {
            "deckName": "Test",
            "modelName": "Basic",
            "fields": {
                "Front": "This is the front of the card",
                "Back": "This is the back of the card"
            },
            "options": {
                "allowDuplicate": false,
                "duplicateScope": "deck"
            },
            "tags": [
                "anki-md"
            ]
        }
    }
}'
```