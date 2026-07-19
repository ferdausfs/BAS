import { X, Wallet, Users, Gift, ArrowDownLeft, RefreshCw } from 'lucide-react';
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
      <header className="flex shrink-0 items-center justify-between border-b border-divider bg-surface px-5 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <p className="text-[12px] font-medium text-text-tertiary">Your rewards</p>
          <h1 className=" text-[24px] font-bold tracking-[-0.02em] text-text">Wallet history</h1>
        </div>
        <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-secondary text-text transition active:scale-90" aria-label="Close wallet history"><X className="h-5 w-5" /></button>
      </header>

      <div className="shrink-0 px-5 py-5">
        <section className="rounded-[24px] border border-accent bg-secondary p-5 shadow-card">
          <div className="flex items-center gap-3 text-primary"><span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-surface shadow-card"><Wallet className="h-5 w-5" /></span><span className="text-[13px] font-semibold">Available balance</span></div>
          <p className="mt-4 text-[32px] font-bold leading-none tabular text-text">৳{balance.toLocaleString()}</p>
          <p className="mt-2 text-[13px] text-text-secondary">Total earned: <span className="font-semibold text-text">৳{totalEarned.toLocaleString()}</span></p>
        </section>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <h2 className="mb-3 text-[16px] font-semibold text-text">Transactions</h2>
        {txns.length === 0 ? (
          <div className="flex flex-col items-center rounded-[24px] border border-border bg-surface px-6 py-14 text-center shadow-card">
            <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary"><Wallet className="h-8 w-8" strokeWidth={1.5} /></span>
            <p className="mt-4 text-[16px] font-semibold text-text">No transactions yet</p>
            <p className="mt-1 text-[13px] text-text-secondary">Your rewards and redemptions will show here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card divide-y divide-divider">
            {txns.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-ink-50"><TxIcon type={transaction.type} /></span><div className="min-w-0"><TxLabel tx={transaction} /><p className="mt-0.5 text-[11px] text-text-tertiary">{formatDate(transaction.date)}</p></div></div>
                <span className={`shrink-0 text-[14px] font-bold tabular ${transaction.amount >= 0 ? 'text-success' : 'text-primary'}`}>{transaction.amount >= 0 ? '+' : '-'}৳{Math.abs(transaction.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
