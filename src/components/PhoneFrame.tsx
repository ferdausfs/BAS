import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onLogoTap?: () => void;
}

/**
 * Phone frame:
 * - On small viewports: fullscreen native mobile experience.
 * - On md+: centered "phone" stage with soft warm gradients around it.
 */
export default function PhoneFrame({ children, onLogoTap }: Props) {
  return (
    <div className="min-h-screen w-full mesh-warm">
      {/* Desktop stage */}
      <div className="hidden md:block">
        <div className="mx-auto flex min-h-screen items-center justify-center px-6 py-10">
          <div className="relative">
            {/* Decorative warm blobs */}
            <div className="pointer-events-none absolute -inset-40">
              <div className="anim-blob absolute top-10 left-0 h-72 w-72 rounded-full bg-coral-200/40 blur-3xl" />
              <div className="anim-blob absolute right-0 bottom-10 h-80 w-80 rounded-full bg-blush-200/50 blur-3xl" style={{ animationDelay: '4s' }} />
              <div className="absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
            </div>

            {/* Phone bezel — modern minimal */}
            <div
              className="relative rounded-[44px] border border-black/10 bg-[#1a1311] p-[8px] shadow-[0_50px_100px_-30px_rgba(26,19,17,.45),0_0_0_1px_rgba(255,255,255,.04)_inset]"
              style={{
                height: 'min(880px, calc(100vh - 60px))',
                width: 'min(420px, calc((100vh - 60px) * 0.477))',
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-cream">
                <div className="absolute inset-0 flex flex-col overflow-hidden" data-logo-tap-handler onClick={onLogoTap ? undefined : undefined}>{children}</div>
                <HomeIndicator />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / native */}
      <div className="relative h-[100dvh] overflow-hidden md:hidden">
        <div className="absolute inset-0 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="pointer-events-none absolute right-0 bottom-1.5 left-0 z-50 flex justify-center">
      <div className="h-[5px] w-[130px] rounded-full bg-ink/85" />
    </div>
  );
}