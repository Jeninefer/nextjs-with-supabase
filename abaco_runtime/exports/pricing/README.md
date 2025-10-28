# Pricing Export Channel

Pricing artifacts originate from the `pricing_engine.rate_cards` view.  Each
refresh emits:

- `rate_cards_<yyyymmdd>.csv`
- `limit_adjustments_<yyyymmdd>.csv`

Files are consumed by the credit policy automation service and must remain
numerically consistent with the Supabase source tables.  Never edit data here by
hand.
