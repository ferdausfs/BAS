import { ArrowLeft, Wallet, Users, Gift, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { useWallet, type WalletTx } from '../lib/store';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';

interface Props { open: boolean; onClose: () => void; }

function TxIcon({ type }: { type: WalletTx['type'] }) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'order_earn': return <Wallet className={`${iconClass} text-success`} />;
    case 'referral_earn': return <Users className={`${iconClass} text-success`} />;
    case 'referral_bonus': return <Gift className={`${iconClass} text-success`} />;
    case 'redeem': return <ArrowDownLeft className={`${iconClass} text-primary`} />;
    case 'refund': return <RefreshCw className={`${iconClass} text-warning`} />;
    default: return <Wallet className={`${iconClass} text-success`} />;
  }
}

function TxLabel({ tx }: { tx: WalletTx }) {
  const labels: Record<WalletTx['type'], string> = {
    order_earn: 'Order reward', referral_earn: 'Referral bonus', referral_bonus: 'Welcome bonus', redeem: 'Redeemed', refund: 'Wallet refund',
  };
  return <span className="text-[14px] font-semibold text-text">{labels[tx.type] ?? 'Transaction'}{tx.pending && <span className="ml-1 text-[11px] font-normal text-text-tertiary">(pending)</span>}</span>;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('en-BD', { month: 'short' });
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} · ${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}

export default function WalletHistoryModal({ open, onClose }: Props) {
  const { balance, totalEarned, txns } = useWallet();
  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);
  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex flex-col bg-bg ${closing ? 'anim-right-out' : 'anim-right'}`} role="dialog" aria-modal="true" aria-label="Wallet history">
      <header className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="relative flex h-14 items-center justify-center">
          <button type="button" onClick={onClose} className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-secondary shadow-card transition active:scale-95" aria-label="Close wallet history">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <h1 className="text-[20px] font-semibold tracking-tight text-text">My Wallet</h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8">
        <section className="rounded-[20px] border border-border bg-secondary p-4 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-text-secondary">Wallet Balance</p>
              <p className="mt-1 text-[28px] font-semibold leading-none tabular text-text">৳{balance.toLocaleString()}</p>
              <p className="mt-2 text-[12px] text-text-secondary">Total earned ৳{totalEarned.toLocaleString()}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-surface text-primary shadow-card">
              <Wallet className="h-6 w-6" strokeWidth={1.7} />
            </span>
          </div>
          <button type="button" className="mt-5 flex h-12 w-full items-center justify-center rounded-[16px] bg-primary text-[15px] font-bold text-white shadow-btn active:scale-[.98]">
            Add Money
          </button>
        </section>

        <div className="mt-7">
          <h2 className="mb-3 text-[18px] font-semibold text-text-secondary">Transactions</h2>
          {txns.length === 0 ? (
            <div className="rounded-[18px] border border-border bg-surface px-5 py-8 text-center shadow-card">
              <Wallet className="mx-auto h-8 w-8 text-primary" strokeWidth={1.7} />
              <p className="mt-3 text-[14px] font-semibold text-text">No transactions yet</p>
              <p className="mt-1 text-[12px] text-text-secondary">Your rewards and redemptions will show here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {txns.map((transaction) => (
                <div key={transaction.id} className="rounded-[14px] border border-border bg-surface px-4 py-3 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <TxIcon type={transaction.type} />
                        <TxLabel tx={transaction} />
                      </div>
                      <p className="mt-1 text-[12px] text-text-secondary">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-[15px] font-semibold tabular ${transaction.amount >= 0 ? 'text-success' : 'text-primary'}`}>{transaction.amount >= 0 ? '+' : '-'}৳{Math.abs(transaction.amount).toLocaleString()}</p>
                      <p className="mt-1 text-[12px] text-text-secondary">Balance ৳{balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
