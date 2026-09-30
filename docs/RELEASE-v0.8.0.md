# BuildMate v0.8.0 — Homeowner Beta

Release date: 2026-09-30

## Goal

Make BuildMate understandable and useful to a homeowner before adding more engineering breadth.

## Product changes

- Sidebar/tab web application with five primary views:
  - Tổng quan
  - Thông tin nhà
  - Kỹ thuật
  - Giá & ngân sách
  - Báo cáo
- Dashboard answers the homeowner's core questions:
  - current budget range
  - project completion/readiness
  - next blocking actions
  - current engineering status
- Public composite demo fixture based on published 4×16 m / 3-storey / 4-bedroom townhouse references.
- One-click demo A-to-Z calculation run for all six tracked engineering domains.

## Guided engineering

Primary homeowner workflows no longer require JSON:

- permanent load
- RC beam check
- shallow-foundation settlement
- XLPE cable sizing
- domestic water design flow
- residential outdoor air

Raw JSON calculator and project-evidence controls remain under Expert mode.

## Calculation transparency

Calculation history now renders:

- standard/workflow
- key result
- human-readable formula/basis
- substitution/logic steps
- immutable calculation digest
- raw input/result when expanded

## Pricing

- Daily snapshot refresh continues.
- Daily history is now appended to a generated market-price history.
- UI shows price trend once at least two historical points exist.
- Material drift is shown separately from whole-house turnkey movement.

## Safety boundary

The public demo contains synthetic engineering values where public design sources do not provide real calculation inputs. Those values are explicitly demo-only and must not be treated as a construction design.
