# Flows

## Flow 0201

### context.copilot_event
{"action":"IntentStart","intent":{"id":"get_policy","intent_id":"get_policy","name":"Policy Number","completed":false,"injected":true}}
{"action":"SubmitIntent","id":"get_policy","intent_name":"Policy Number","user_policy_number":"206970670"}
{"action":"IntentStart","intent":{"id":"update_customer_data","name":"Update Customer Data","intent_name":"Update Customer Data","intent_id":"update_customer_data","completed":false}}




# use Cases

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

