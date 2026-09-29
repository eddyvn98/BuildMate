# Data Model

## Project

```text
Project
  id
  name
  locality
  land
  household
  requirements
  budget
  fields[]
  alternatives[]
  activeAlternativeId
  createdAt
  updatedAt
```

## FieldValue

```text
FieldValue
  key
  value
  unit?
  state: confirmed | suggested | assumed | missing | blocked
  source: user | buildmate | imported | market
  note?
```

## Alternative

```text
Alternative
  id
  name
  storeys
  footprintRatio
  finishLevel
  optionalScope[]
  calculations[]
```

## CalculationResult

```text
CalculationResult
  id
  label
  value
  unit
  level
  formulaId
  engineVersion
  inputs[]
  references[]
  warnings[]
```

## PriceItem

```text
PriceItem
  code
  label
  unit
  value
  locality
  effectiveDate
  sourceLabel
  sourceUrl?
  userOverride?
```
