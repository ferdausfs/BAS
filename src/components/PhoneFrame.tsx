import type { ReactNode } from 'react';

interface Props { children: ReactNode; onLogoTap?: () => void; }

/** Fullscreen mobile canvas with a restrained desktop device preview. */
export default function PhoneFrame({ children, onLogoTap }: Props) {
  return (
    <div className="min-h-screen w-full bg-bg">
      <div className="hidden min-h-screen bg-secondary/45 md:flex md:items-center md:justify-center md:p-10">
        <div
          className="relative rounded-[44px] border-[8px] border-text bg-text p-0 shadow-[0_28px_70px_-24px_rgba(246,95,143,0.34)]"
          style={{ height: 'min(880px, calc(100vh - 60px))', width: 'min(420px, calc((100vh - 60px) * 0.477))' }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-bg">
            <div className="absolute inset-0 flex flex-col overflow-hidden" data-logo-tap-handler onClick={onLogoTap ? undefined : undefined}>{children}</div>
            <HomeIndicator />
          </div>
        </div>
      </div>

      <div className="relative h-[100dvh] overflow-hidden bg-bg md:hidden">
        <div className="absolute inset-0 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="pointer-events-none absolute bottom-1.5 left-0 right-0 z-[110] flex justify-center">
      <div className="h-1.5 w-28 rounded-full bg-text/80" />
    </div>
  );
}
