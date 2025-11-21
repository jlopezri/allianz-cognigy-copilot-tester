# Transcript data required

## Common

### User authentication
- User name
- User NIF
- User birthdate

### Policy identification
- Policy number

### Use case identifition
- Use cases related

## Use cases

### Customer data update

### FNOL

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

# Data format
