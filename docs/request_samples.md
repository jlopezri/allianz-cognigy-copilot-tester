# Flows

## Flow 0201

### context.copilot_event
{"action":"IntentStart","intent":{"id":"get_policy","intent_id":"get_policy","name":"Policy Number","completed":false,"injected":true}}
{"action":"SubmitIntent","id":"get_policy","intent_name":"Policy Number","user_policy_number":"206970670"}
{"action":"IntentStart","intent":{"id":"update_customer_data","name":"Update Customer Data","intent_name":"Update Customer Data","intent_id":"update_customer_data","completed":false}}

# Use Cases

## From Flow to IFrame

### Intents

context.intent_identified: {
  intent_id 
}
context.intents_list_detected: []


### Use case FNOL

context.useCaseFNOL = {
  incident_details: {
    detailed_description,
    cause_category,
    date_of_occurence,
    affected_area: [],
    damaged_objects: [{
      object_type,
      object_amount
    }]
  },
  repair_status: {
    repair_required,
    assessment_available
  },
  isUserSafe,
}

# Postbacks

## User authentication

### Start
{ 
  action: "IntentStart"
  intent: { 
    id: "authentication", 
    name: "User Authentication", 
    completed: false,
    injected: true
  }
​​}

### Submit
{
  action: "SubmitIntent",
  id: "authentication",
  intent_name: "User Authentication",
  agentDescription: "Please provide your mobile phone number and location from where you are calling.",
  full_name: "Andreia Filipa Almeida Souza",
  name: "Andreia Filipa Almeida Souza",
  nif: "24028390202",
  birthdate: "1994-12-09"
}

## Policy identification

### Start
{
  action: "IntentStart",
  intent: {
    id: "get_policy",
    intent_id: "get_policy",
    name: "Policy Number",
    completed: false,
    injected: true
  }
}

### Submit
{
  action: "SubmitIntent",
  id: "get_policy",
  intent_name: "Policy Number",
  user_policy_number: "206970670"
}

## Update Customer Data

### Start
{
  action: "IntentStart",
  intent: {
    id: "update_customer_data",
    intent_id: "update_customer_data"
    intent_name: "Update Customer Data"
    name: "Update Customer Data",
    completed: false
  }
}
​​
### Submit
{
  id: "update_customer_data",
  intent_id: "update_customer_data",
  intent_name: "Update Customer Data",
  selected_caller_type: "legal",
  visible_form: "natural",
  email: "",
  phone_country: "",
  phone_number: "",
  mailing_address: "",
  profession: "",
  natural_person: false,
  requires_certificate: false
}

## FNOL

### Start

### Submit



# Doubts

- How start a conversation with an already authenticated customer? (right now all customers start unidentified)
- Why the `Start` Postback attributes are different in `User authentication` and `Policy identification`?
- Do we need the Cognigy bot to answer `Transcript Receveid` to each message?
