import calendar
from datetime import date
from decimal import Decimal, ROUND_DOWN

ZERO = Decimal("0")
GENERAL_TAX_RATE = Decimal("15.4000")


def floor_won(value):
    return int(Decimal(value).quantize(Decimal("1"), rounding=ROUND_DOWN))


def add_months(value, months):
    index = value.month - 1 + months
    year, month = value.year + index // 12, index % 12 + 1
    return date(year, month, min(value.day, calendar.monthrange(year, month)[1]))


def next_month_payment_date(start, day):
    return add_months(start.replace(day=1), 1).replace(day=day)


def calculate_applied_rate(option, conditions):
    bonus = sum((Decimal(x.additional_interest_rate) for x in conditions), ZERO)
    return min(Decimal(option.base_interest_rate) + bonus, Decimal(option.max_interest_rate))


def calculate_tax(interest):
    return floor_won(Decimal(interest) * GENERAL_TAX_RATE / Decimal("100"))


def _month_count(start, end):
    return max((end.year - start.year) * 12 + end.month - start.month, 0)


def _compound_interest(principal, annual_rate, months):
    monthly_rate = Decimal(annual_rate) / Decimal("1200")
    return Decimal(principal) * ((Decimal("1") + monthly_rate) ** months - Decimal("1"))


def calculate_deposit_result(principal, annual_rate, start, maturity,
                             interest_method="SIMPLE"):
    if interest_method == "COMPOUND":
        raw = _compound_interest(principal, annual_rate, _month_count(start, maturity))
    else:
        raw = (Decimal(principal) * Decimal(annual_rate) / 100
               * Decimal((maturity - start).days) / 365)
    gross = floor_won(raw)
    tax = calculate_tax(gross)
    return {"expected_interest": gross, "expected_tax": tax,
            "expected_interest_after_tax": gross - tax,
            "expected_maturity_amount": principal + gross - tax,
            "maturity_date": maturity.isoformat()}


def build_saving_schedule(start, payment_day, count):
    return [start] + [add_months(start.replace(day=1), i).replace(day=payment_day)
                      for i in range(1, count)]


def calculate_saving_result(amount, rate, start, maturity, payment_day, count,
                            interest_method="SIMPLE"):
    schedule = build_saving_schedule(start, payment_day, count)
    if interest_method == "COMPOUND":
        raw = sum((_compound_interest(amount, rate, _month_count(paid, maturity))
                   for paid in schedule), ZERO)
    else:
        raw = sum((Decimal(amount) * Decimal(rate) / 100
                   * Decimal(max((maturity - paid).days, 0)) / 365
                   for paid in schedule), ZERO)
    gross = floor_won(raw)
    tax = calculate_tax(gross)
    principal = amount * count
    return {"payment_count": count, "total_principal": principal,
            "expected_interest": gross, "expected_tax": tax,
            "expected_interest_after_tax": gross - tax,
            "expected_maturity_amount": principal + gross - tax,
            "maturity_date": maturity.isoformat()}


def resolve_termination_rate(option, rule):
    if rule.calculation_type == "FIXED_RATE":
        return Decimal(rule.rate_value)
    return Decimal(option.base_interest_rate) * Decimal(rule.rate_value) / 100


def calculate_deposit_termination(contract, option, rule, ended):
    rate = resolve_termination_rate(option, rule)
    gross = floor_won(Decimal(contract.principal) * rate / 100
                      * Decimal(max((ended - contract.start_date).days, 0)) / 365)
    tax = calculate_tax(gross)
    return {"applied_rate": rate, "gross_interest": gross, "tax_amount": tax,
            "net_interest": gross - tax, "payout_amount": contract.principal + gross - tax}


def calculate_saving_termination(payments, option, rule, ended):
    rate, raw, principal = resolve_termination_rate(option, rule), ZERO, 0
    for payment in payments:
        principal += payment.amount
        raw += (Decimal(payment.amount) * rate / 100
                * Decimal(max((ended - payment.scheduled_date).days, 0)) / 365)
    gross = floor_won(raw)
    tax = calculate_tax(gross)
    return {"applied_rate": rate, "gross_interest": gross, "tax_amount": tax,
            "net_interest": gross - tax, "payout_amount": principal + gross - tax}


def calculate_saving_maturity(payments, annual_rate, maturity,
                              interest_method="SIMPLE"):
    raw, principal = ZERO, 0
    for payment in payments:
        principal += payment.amount
        if interest_method == "COMPOUND":
            raw += _compound_interest(
                payment.amount,
                annual_rate,
                _month_count(payment.scheduled_date, maturity),
            )
        else:
            raw += (Decimal(payment.amount) * Decimal(annual_rate) / 100
                    * Decimal(max((maturity - payment.scheduled_date).days, 0)) / 365)
    gross = floor_won(raw)
    tax = calculate_tax(gross)
    return {"gross_interest": gross, "tax_amount": tax,
            "net_interest": gross - tax, "payout_amount": principal + gross - tax}
