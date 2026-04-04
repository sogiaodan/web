import { GenealogyNode, ParishionerSummaryRef } from '@/types/parishioner';

interface Props {
  genealogy: GenealogyNode[];
  father: ParishionerSummaryRef | null;
  currentName: string;
  christianName: string;
}

// ─── Node Card ────────────────────────────────────────────────────────────────

function GenealogyNodeCard({
  label,
  name,
  christianName,
  variant = 'default',
}: {
  label: string;
  name: string | null;
  christianName?: string | null;
  variant?: 'default' | 'primary' | 'self' | 'empty';
}) {
  if (variant === 'empty' || !name) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#F5F5F4] border border-dashed border-[#D6D3D1] rounded p-4 w-[148px] min-h-[72px] opacity-50">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">
          {label}
        </p>
        <p className="text-xs text-[#78716C] font-body italic mt-1">Chưa rõ</p>
      </div>
    );
  }

  if (variant === 'primary') {
    return (
      <div className="flex flex-col items-center justify-center bg-primary rounded p-4 w-[148px] min-h-[72px]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/70 font-body mb-1">
          {label}
        </p>
        {christianName && (
          <p className="text-xs text-white/80 font-display italic leading-none mb-0.5">
            {christianName}
          </p>
        )}
        <p className="font-display font-bold text-sm text-white text-center leading-snug">
          {name}
        </p>
      </div>
    );
  }

  if (variant === 'self') {
    return (
      <div className="flex flex-col items-center justify-center bg-[#F5F5F4] border-2 border-primary/30 rounded p-4 w-[148px] min-h-[72px]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-1">
          {label}
        </p>
        <span className="material-symbols-outlined text-primary text-base mb-0.5">person</span>
        <p className="font-display font-bold text-sm text-[#1C1917] text-center leading-snug">
          {name}
        </p>
      </div>
    );
  }

  // default
  return (
    <div className="flex flex-col items-center justify-center bg-surface border border-[#E7E5E4] rounded p-4 w-[148px] min-h-[72px]">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-1">
        {label}
      </p>
      {christianName && (
        <p className="text-xs text-primary font-display italic leading-none mb-0.5">
          {christianName}
        </p>
      )}
      <p className="font-display font-bold text-sm text-[#1C1917] text-center leading-snug">
        {name}
      </p>
    </div>
  );
}

// ─── Tree Connector SVG (inline, clean lines) ─────────────────────────────────

/**
 * Renders the connecting lines between the grandparent row and the father card.
 * Uses an inline SVG for precise control over the tree structure:
 *
 *   [ÔNG NỘI]────[BÀ NỘI]
 *          |
 *      [PHỤ MẪU]
 */
function GrandparentConnector({ hasBoth }: { hasBoth: boolean }) {
  // Width = 2 cards (148px each) + gap (24px) = 320px total
  // Line drops from midpoint between cards (160px from left)
  return (
    <div className="flex justify-center">
      <svg
        width="320"
        height="40"
        viewBox="0 0 320 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {hasBoth ? (
          <>
            {/* Horizontal bar connecting midpoints of each card */}
            <line x1="74" y1="4" x2="246" y2="4" stroke="#D6D3D1" strokeWidth="1.5" />
            {/* Left vertical from ÔNG NỘI mid */}
            <line x1="74" y1="0" x2="74" y2="4" stroke="#D6D3D1" strokeWidth="1.5" />
            {/* Right vertical from BÀ NỘI mid */}
            <line x1="246" y1="0" x2="246" y2="4" stroke="#D6D3D1" strokeWidth="1.5" />
            {/* Center vertical going down */}
            <line x1="160" y1="4" x2="160" y2="40" stroke="#D6D3D1" strokeWidth="1.5" />
          </>
        ) : (
          /* Only one grandparent — straight line down from that card's center */
          <line x1="160" y1="0" x2="160" y2="40" stroke="#D6D3D1" strokeWidth="1.5" />
        )}
      </svg>
    </div>
  );
}

function SimpleVerticalConnector() {
  return (
    <div className="flex justify-center">
      <div className="w-px h-8 bg-[#D6D3D1]" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GenealogyTree({ genealogy, father, currentName, christianName }: Props) {
  const paternalGrandfather = genealogy.find((n) => n.role === 'PATERNAL_GRANDFATHER') ?? null;
  const paternalGrandmother = genealogy.find((n) => n.role === 'PATERNAL_GRANDMOTHER') ?? null;
  const fatherFromGenealogy = genealogy.find((n) => n.role === 'FATHER') ?? null;

  const hasGrandparents = !!(paternalGrandfather || paternalGrandmother);
  const hasBothGrandparents = !!(paternalGrandfather && paternalGrandmother);

  // Use father from the relationship, falling back to the genealogy node
  const fatherName = father?.full_name ?? fatherFromGenealogy?.full_name ?? null;
  const fatherChristian = father?.christian_name ?? fatherFromGenealogy?.christian_name ?? null;
  const hasFather = !!(fatherName);

  if (!hasGrandparents && !hasFather) {
    return (
      <section>
        <h2 className="font-display font-bold text-lg text-[#1C1917] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
          Gia phả Ba đời
        </h2>
        <div className="bg-surface border border-dashed border-outline rounded p-8 text-center text-[#78716C] font-body text-sm">
          Chưa có dữ liệu gia phả ba đời.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display font-bold text-lg text-[#1C1917] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
        Gia phả Ba đời
        <span className="text-xs font-body font-normal text-[#78716C]">(Ledger View)</span>
      </h2>

      {/* ── DESKTOP TREE (md+): SVG connector + horizontal grandparent row ── */}
      <div className="hidden md:block bg-surface border border-outline rounded p-6 overflow-x-auto">
        <div className="flex flex-col items-center min-w-[320px]">

          {/* Generation 2: Grandparents */}
          {hasGrandparents && (
            <>
              <div className="flex items-stretch gap-6">
                <GenealogyNodeCard
                  label="ÔNG NỘI"
                  name={paternalGrandfather?.full_name ?? null}
                  christianName={paternalGrandfather?.christian_name}
                  variant={paternalGrandfather ? 'default' : 'empty'}
                />
                <GenealogyNodeCard
                  label="BÀ NỘI"
                  name={paternalGrandmother?.full_name ?? null}
                  christianName={paternalGrandmother?.christian_name}
                  variant={paternalGrandmother ? 'default' : 'empty'}
                />
              </div>
              <GrandparentConnector hasBoth={hasBothGrandparents} />
            </>
          )}

          {/* Generation 1: Father */}
          {hasFather ? (
            <>
              <GenealogyNodeCard
                label="PHỤ MẪU"
                name={fatherName}
                christianName={fatherChristian}
                variant="primary"
              />
              <SimpleVerticalConnector />
            </>
          ) : hasGrandparents ? (
            <>
              <GenealogyNodeCard label="PHỤ MẪU" name={null} variant="empty" />
              <SimpleVerticalConnector />
            </>
          ) : null}

          {/* Generation 0: Self */}
          <GenealogyNodeCard
            label="BẢN THÂN"
            name={currentName}
            christianName={christianName}
            variant="self"
          />
        </div>
      </div>

      {/* ── MOBILE TREE (< md): vertical stack with CSS connectors ─────── */}
      <div className="md:hidden bg-surface border border-outline rounded p-4 space-y-0">

        {/* Grandparents stacked */}
        {hasGrandparents && (
          <div className="space-y-2 pb-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-2">
              Ông Bà Nội
            </p>
            <MobileGenealogyRow
              label="ÔNG NỘI"
              name={paternalGrandfather?.full_name ?? null}
              christianName={paternalGrandfather?.christian_name}
            />
            <MobileGenealogyRow
              label="BÀ NỘI"
              name={paternalGrandmother?.full_name ?? null}
              christianName={paternalGrandmother?.christian_name}
            />
            {/* Connector line */}
            <div className="flex justify-center pt-1">
              <div className="w-px h-6 bg-[#D6D3D1]" />
            </div>
          </div>
        )}

        {/* Father */}
        {(hasFather || hasGrandparents) && (
          <div className="pb-3">
            <div className="flex items-center gap-3 bg-primary rounded p-3">
              <div className="shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 font-body">PHỤ MẪU</p>
              </div>
              <div className="flex-1 min-w-0">
                {fatherChristian && (
                  <p className="text-xs text-white/70 font-display italic leading-none">{fatherChristian}</p>
                )}
                <p className="font-display font-bold text-sm text-white truncate">
                  {fatherName ?? 'Chưa rõ'}
                </p>
              </div>
            </div>
            {/* Connector line */}
            <div className="flex justify-center">
              <div className="w-px h-6 bg-[#D6D3D1]" />
            </div>
          </div>
        )}

        {/* Self */}
        <div className="flex items-center gap-3 bg-[#F5F5F4] border-2 border-primary/30 rounded p-3">
          <span className="material-symbols-outlined text-primary text-base shrink-0">person</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">BẢN THÂN</p>
            {christianName && (
              <p className="text-xs text-primary font-display italic leading-none">{christianName}</p>
            )}
            <p className="font-display font-bold text-sm text-[#1C1917] truncate">{currentName}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mobile Row Helper ────────────────────────────────────────────────────────

function MobileGenealogyRow({
  label,
  name,
  christianName,
}: {
  label: string;
  name: string | null;
  christianName?: string | null;
}) {
  if (!name) {
    return (
      <div className="flex items-center gap-3 bg-[#F5F5F4] border border-dashed border-[#D6D3D1] rounded p-3 opacity-50">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">{label}</p>
        <p className="text-xs text-[#78716C] font-body italic">Chưa rõ</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 bg-surface border border-[#E7E5E4] rounded p-3">
      <div className="shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">{label}</p>
      </div>
      <div className="flex-1 min-w-0">
        {christianName && (
          <p className="text-xs text-primary font-display italic leading-none">{christianName}</p>
        )}
        <p className="font-display font-bold text-sm text-[#1C1917] truncate">{name}</p>
      </div>
    </div>
  );
}

