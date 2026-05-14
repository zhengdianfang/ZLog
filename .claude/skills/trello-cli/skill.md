name: trello-cli

args:
  - name: operation
    description: "The operation to perform: 'create' to create a new card in the TODO column, or 'update' to append content to an existing card."
    required: true
  - name: card_title
    description: "The title of the card. Required when operation is 'create'."
    required: false
  - name: card_id
    description: "The existing card ID. Required when operation is 'update'."
    required: false
  - name: content
    description: "The markdown content for the card description (create) or the section to append (update)."
    required: true

description: A Trello CLI utility for the ZLog project. Creates and updates story cards on the ZLog Trello board. Reads API credentials from .claude/settings.local.json automatically.

---

## Credential Loading

Read API credentials from `.claude/settings.local.json`:

```bash
TRELLO_API_KEY=$(python3 -c "import json; d=json.load(open('.claude/settings.local.json')); print(d['env']['TRELLO_API_KEY'])")
TRELLO_API_TOKEN=$(python3 -c "import json; d=json.load(open('.claude/settings.local.json')); print(d['env']['TRELLO_API_TOKEN'])")
```

Verify credentials are loaded (non-empty) before proceeding. If either is empty, stop and report an error.

---

## Board Discovery

List all Trello boards for the authenticated user to find the ZLog board:

```bash
curl -s "https://api.trello.com/1/members/me/boards?key=$TRELLO_API_KEY&token=$TRELLO_API_TOKEN&fields=id,name"
```

Parse the response to find the board whose `name` contains "ZLog" (case-insensitive). Extract its `id` as `BOARD_ID`.

---

## Operation: create

**Purpose:** Create a new card in the TODO column of the ZLog board.

### Step 1 — Find the TODO List

```bash
curl -s "https://api.trello.com/1/boards/$BOARD_ID/lists?key=$TRELLO_API_KEY&token=$TRELLO_API_TOKEN&fields=id,name"
```

Parse the response to find the list whose `name` matches "TODO" (case-insensitive). Extract its `id` as `TODO_LIST_ID`.

If no list named "TODO" is found, report the available list names and stop.

### Step 2 — Create the Card

```bash
curl -s -X POST "https://api.trello.com/1/cards" \
  -d "key=$TRELLO_API_KEY" \
  -d "token=$TRELLO_API_TOKEN" \
  -d "idList=$TODO_LIST_ID" \
  -d "name={{card_title}}" \
  --data-urlencode "desc={{content}}"
```

### Step 3 — Return Result

Parse the response and output:
- `card_id`: the `id` field from the created card
- `card_url`: the `shortUrl` field from the created card
- Confirm: "Card '{{card_title}}' created in TODO column."

---

## Operation: update

**Purpose:** Append a new section to an existing card's description without overwriting existing content.

### Step 1 — Fetch Existing Description

```bash
curl -s "https://api.trello.com/1/cards/{{card_id}}?key=$TRELLO_API_KEY&token=$TRELLO_API_TOKEN&fields=desc,name"
```

Extract the `desc` field as `EXISTING_DESC`.

### Step 2 — Build Updated Description

Concatenate: `UPDATED_DESC = EXISTING_DESC + "\n\n" + {{content}}`

### Step 3 — Update the Card

```bash
curl -s -X PUT "https://api.trello.com/1/cards/{{card_id}}" \
  -d "key=$TRELLO_API_KEY" \
  -d "token=$TRELLO_API_TOKEN" \
  --data-urlencode "desc=$UPDATED_DESC"
```

### Step 4 — Return Result

Output:
- Confirm: "Card {{card_id}} updated successfully."
- Show the first 3 lines of the appended section so the caller can verify.
