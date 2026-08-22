from app.extensions import db
from app.models.deposits_savings import LedgerEntry, LedgerTransaction


def create_ledger(account, transaction_type, amount, entry_type, reference_type, reference_id):
    row = LedgerTransaction(account_id=account.account_id, user_id=account.user_id,
                            transaction_type=transaction_type, amount=abs(amount),
                            balance_after=account.balance, reference_type=reference_type,
                            reference_id=reference_id)
    row.entries.append(LedgerEntry(entry_type=entry_type, amount=abs(amount)))
    db.session.add(row)
    return row
