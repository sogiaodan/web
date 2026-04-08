import { GenealogyNode, ParishionerSummaryRef } from '@/types/parishioner';

interface Props {
  genealogy: GenealogyNode[];
  father: ParishionerSummaryRef | null;
  mother: ParishionerSummaryRef | null;
  currentName: string;
  christianName: string;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'primary' | 'self' | 'empty' | 'descendant' | 'spouse';

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
  variant?: CardVariant;
}) {
  if (variant === 'empty' || !name) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#F5F5F4] border border-dashed border-[#D6D3D1] rounded p-4 w-[140px] min-h-[72px] opacity-50">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">{label}</p>
        <p className="text-xs text-[#78716C] font-body italic mt-1">Chưa rõ</p>
      </div>
    );
  }

  const styleMap: Record<CardVariant, { wrap: string; labelCls: string; nameCls: string; icon?: string }> = {
    default:    { wrap: 'bg-surface border border-[#E7E5E4]',             labelCls: 'text-[#78716C]',  nameCls: 'text-[#1C1917]' },
    primary:    { wrap: 'bg-primary',                                      labelCls: 'text-white/70',   nameCls: 'text-white' },
    self:       { wrap: 'bg-[#F5F5F4] border-2 border-primary/30',         labelCls: 'text-[#78716C]',  nameCls: 'text-[#1C1917]', icon: 'person' },
    descendant: { wrap: 'bg-emerald-50 border border-emerald-200',          labelCls: 'text-emerald-600', nameCls: 'text-[#1C1917]' },
    spouse:     { wrap: 'bg-teal-50 border border-teal-200',               labelCls: 'text-teal-600',   nameCls: 'text-[#1C1917]' },
    empty:      { wrap: '', labelCls: '', nameCls: '' },
  };

  const { wrap, labelCls, nameCls, icon } = styleMap[variant];
  const christCls = variant === 'primary' ? 'text-white/80' : variant === 'descendant' ? 'text-emerald-500' : variant === 'spouse' ? 'text-teal-500' : 'text-primary';

  return (
    <div className={`flex flex-col items-center justify-center rounded p-3 w-[140px] min-h-[72px] relative transition-all hover:shadow-md ${wrap}`}>
      <p className={`text-[9px] font-bold uppercase tracking-widest font-body mb-1 ${labelCls}`}>{label}</p>
      {icon && <span className={`material-symbols-outlined text-base mb-0.5 ${variant === 'self' ? 'text-primary' : ''}`}>{icon}</span>}
      {christianName && <p className={`text-xs font-display italic leading-none mb-0.5 ${christCls}`}>{christianName}</p>}
      <p className={`font-display font-bold text-sm text-center leading-snug ${nameCls}`}>{name}</p>
    </div>
  );
}

// ─── Connectors ───────────────────────────────────────────────────────────────

function GrandparentConnector({ hasBoth }: { hasBoth: boolean }) {
  return (
    <div className="flex justify-center">
      <svg width="320" height="40" viewBox="0 0 320 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {hasBoth ? (
          <>
            <line x1="74" y1="4" x2="246" y2="4" stroke="#D6D3D1" strokeWidth="1.5" />
            <line x1="74" y1="0" x2="74" y2="4" stroke="#D6D3D1" strokeWidth="1.5" />
            <line x1="246" y1="0" x2="246" y2="4" stroke="#D6D3D1" strokeWidth="1.5" />
            <line x1="160" y1="4" x2="160" y2="40" stroke="#D6D3D1" strokeWidth="1.5" />
          </>
        ) : (
          <line x1="160" y1="0" x2="160" y2="40" stroke="#D6D3D1" strokeWidth="1.5" />
        )}
      </svg>
    </div>
  );
}

function VerticalLine({ color = '#D6D3D1', height = 'h-8' }: { color?: string; height?: string }) {
  return (
    <div className="flex justify-center">
      <div className={`w-px ${height}`} style={{ backgroundColor: color }} />
    </div>
  );
}

// ─── Family Block (nested family unit) ───────────────────────────────────

function FamilyBlock({
  node,
  label,
  variant = 'descendant',
  lineColor = '#6ee7b7',
  offspring = []
}: {
  node: GenealogyNode;
  label: string;
  variant?: CardVariant;
  lineColor?: string;
  offspring?: GenealogyNode[];
}) {
  const hasSpouse = !!node.child_spouse_full_name;
  const spouseLabel = node.child_spouse_gender === 'FEMALE' ? 'DÂU' : node.child_spouse_gender === 'MALE' ? 'RỂ' : 'BẠN ĐỜI';

  return (
    <div className="flex flex-col items-center">
      <div className="w-px h-4" style={{ backgroundColor: lineColor }} />
      
      {/* Node (The biological child) */}
      <GenealogyNodeCard
        label={label}
        name={node.full_name}
        christianName={node.christian_name}
        variant={variant}
      />

      {/* Spouse (The In-law) - Render BELOW biological relative */}
      {hasSpouse && (
        <>
          <div className="flex flex-col items-center">
             <div className="w-px h-4 bg-teal-200" />
             <div className="flex items-center justify-center bg-white border border-teal-200 rounded-full w-5 h-5 -my-2.5 z-10">
                <span className="material-symbols-outlined text-[10px] text-teal-400">favorite</span>
             </div>
             <div className="w-px h-4 bg-teal-200" />
          </div>
          <GenealogyNodeCard
            label={spouseLabel}
            name={node.child_spouse_full_name!}
            christianName={node.child_spouse_christian_name}
            variant="spouse"
          />
        </>
      )}

      {/* Branching to grandchildren if any */}
      {offspring.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-[#99f6e4]" />
          {offspring.length > 1 && (
            <div className="h-px bg-[#99f6e4]" style={{ width: `${(offspring.length - 1) * 120}px`, maxWidth: '100%' }} />
          )}
          <div className="flex items-start gap-4">
            {offspring.map((gc) => (
              <div key={gc.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-[#99f6e4]" />
                <GenealogyNodeCard
                  label={gc.gender === 'FEMALE' ? 'CHÁU GÁI' : 'CHÁU TRAI'}
                  name={gc.full_name}
                  christianName={gc.christian_name}
                  variant="descendant"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Fan connector from a single point down to N children families */
function FanConnector({ count, color = '#6ee7b7' }: { count: number; color?: string }) {
  if (count === 0) return null;
  if (count === 1) return <VerticalLine color={color} height="h-6" />;

  return (
    <div className="flex justify-center">
      <div className="w-px h-6" style={{ backgroundColor: color }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GenealogyTree({ genealogy, father, mother, currentName, christianName }: Props) {
  const byGen = (gen: number) => genealogy.filter((n) => (n.rel_gen ?? 0) === gen);

  const grandparents = byGen(-2);
  const parentsFromGenealogy = byGen(-1).concat(byGen(0)); 
  const children = byGen(1);
  const grandchildren = byGen(2);

  // Grouping: Each child with their specific biological grandchildren
  const families = children.map(c => ({
    child: c,
    offspring: grandchildren.filter(gc => gc.father_id === c.id || gc.mother_id === c.id)
  }));

  const paternalGrandfather =
    grandparents.find((n) => n.gender === 'MALE') ??
    genealogy.find((n) => n.role === 'PATERNAL_GRANDFATHER') ?? null;
  const paternalGrandmother =
    grandparents.find((n) => n.gender === 'FEMALE') ??
    genealogy.find((n) => n.role === 'PATERNAL_GRANDMOTHER') ?? null;

  const hasGrandparents = !!(paternalGrandfather || paternalGrandmother);
  const hasBothGrandparents = !!(paternalGrandfather && paternalGrandmother);

  const fatherFromGen = parentsFromGenealogy.find((n) => n.gender === 'MALE' || n.role === 'FATHER') ?? null;
  const motherFromGen = parentsFromGenealogy.find((n) => n.gender === 'FEMALE' || n.role === 'MOTHER') ?? null;

  const fatherName = father?.full_name ?? fatherFromGen?.full_name ?? null;
  const fatherChristian = father?.christian_name ?? fatherFromGen?.christian_name ?? null;
  const motherName = mother?.full_name ?? motherFromGen?.full_name ?? null;
  const motherChristian = mother?.christian_name ?? motherFromGen?.christian_name ?? null;

  const hasParents = !!(fatherName || motherName);
  const hasChildren = children.length > 0;
  const hasAny = hasGrandparents || hasParents || hasChildren;

  if (!hasAny) {
    return (
      <section>
        <GenealogyHeader />
        <div className="bg-surface border border-dashed border-outline rounded p-8 text-center text-[#78716C] font-body text-sm">
          Chưa có dữ liệu gia phả ba đời.
        </div>
      </section>
    );
  }

  return (
    <section>
      <GenealogyHeader />

      {/* ── DESKTOP ──────────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-surface border border-outline rounded p-6 overflow-x-auto">
        <div className="flex flex-col items-center min-w-[320px] gap-0">

          {/* Grandparents */}
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

          {/* Parents */}
          {hasParents && (
            <>
              <div className="flex items-stretch gap-6">
                <GenealogyNodeCard
                  label="THÂN PHỤ"
                  name={fatherName}
                  christianName={fatherChristian}
                  variant={fatherName ? 'primary' : 'empty'}
                />
                <GenealogyNodeCard
                  label="THÂN MẪU"
                  name={motherName}
                  christianName={motherChristian}
                  variant={motherName ? 'primary' : 'empty'}
                />
              </div>
              <VerticalLine />
            </>
          )}

          {/* Self */}
          <GenealogyNodeCard
            label="BẢN THÂN"
            name={currentName}
            christianName={christianName}
            variant="self"
          />

          {/* Family groups (Child > Spouse > Grandchildren) */}
          {hasChildren && (
            <>
              <FanConnector count={children.length} />
              {children.length > 1 && (
                <div
                  className="h-px bg-emerald-300"
                  style={{ width: `${Math.min(children.length * 300, 900)}px`, maxWidth: '100%' }}
                />
              )}
              <div className="flex items-start gap-12 flex-wrap justify-center mt-0">
                {families.map((fam) => (
                  <FamilyBlock 
                    key={fam.child.id} 
                    node={fam.child} 
                    label={fam.child.gender === 'FEMALE' ? 'CON GÁI' : 'CON TRAI'} 
                    offspring={fam.offspring}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE ───────────────────────────────────────────────────────── */}
      <div className="md:hidden bg-surface border border-outline rounded p-4 space-y-0 text-text-main">
        {hasGrandparents && (
          <div className="space-y-2 pb-3 border-b border-outline-variant mb-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-2">Ông Bà Nội</p>
            <MobileRow label="ÔNG NỘI" name={paternalGrandfather?.full_name ?? null} christianName={paternalGrandfather?.christian_name} />
            <MobileRow label="BÀ NỘI" name={paternalGrandmother?.full_name ?? null} christianName={paternalGrandmother?.christian_name} />
          </div>
        )}

        {hasParents && (
          <div className="pb-3 space-y-2 border-b border-outline-variant mb-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-2">Cha Mẹ</p>
            {fatherName && <MobileRow label="THÂN PHỤ" name={fatherName} christianName={fatherChristian} variant="primary" />}
            {motherName && <MobileRow label="THÂN MẪU" name={motherName} christianName={motherChristian} variant="primary" />}
          </div>
        )}

        <div className="flex items-center gap-3 bg-[#F5F5F4] border-2 border-primary/30 rounded p-3 mb-6">
          <span className="material-symbols-outlined text-primary text-base shrink-0">person</span>
          <div className="flex-1 min-w-0 text-text-main">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">BẢN THÂN</p>
            {christianName && <p className="text-xs text-primary font-display italic leading-none">{christianName}</p>}
            <p className="font-display font-bold text-sm truncate">{currentName}</p>
          </div>
        </div>

        {hasChildren && (
          <div className="pt-3 space-y-6">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 font-body mb-2 underline decoration-emerald-200 underline-offset-4">Hậu Duệ (Con & Cháu)</p>
            {families.map((fam) => {
              const childLabel = fam.child.gender === 'FEMALE' ? 'CON GÁI' : 'CON TRAI';
              const spouseLabel = fam.child.child_spouse_gender === 'FEMALE' ? 'DÂU' : fam.child.child_spouse_gender === 'MALE' ? 'RỂ' : 'BẠN ĐỜI';
              return (
                <div key={fam.child.id} className="rounded-lg overflow-hidden border-2 border-emerald-100 bg-white p-2">
                  <MobileRow label={childLabel} name={fam.child.full_name} christianName={fam.child.christian_name} variant="descendant" />
                  {fam.child.child_spouse_full_name && (
                    <div className="mt-1 border-t border-dashed border-emerald-100 pt-1">
                      <MobileRow label={spouseLabel} name={fam.child.child_spouse_full_name} christianName={fam.child.child_spouse_christian_name} variant="spouse" />
                    </div>
                  )}
                  {fam.offspring.length > 0 && (
                    <div className="mt-2 ml-4 border-l-2 border-emerald-50 pl-2 space-y-1">
                       <p className="text-[8px] font-bold text-emerald-400 mb-1 uppercase">Các Cháu:</p>
                       {fam.offspring.map(gc => (
                         <div key={gc.id} className="bg-emerald-50/50 rounded p-1.5">
                            <p className="text-[8px] text-emerald-600 font-bold">{gc.gender === 'FEMALE' ? 'CHÁU GÁI' : 'CHÁU TRAI'}</p>
                            <p className="text-xs font-bold text-text-main">{gc.christian_name} {gc.full_name}</p>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function GenealogyHeader() {
  return (
    <h2 className="font-display font-bold text-lg text-[#1C1917] mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
      Gia phả Ba đời
      <span className="text-xs font-body font-normal text-[#78716C]">(Ledger View)</span>
    </h2>
  );
}

// ─── Mobile Row ───────────────────────────────────────────────────────────────

type MobileVariant = 'default' | 'primary' | 'descendant' | 'spouse';

function MobileRow({
  label,
  name,
  christianName,
  variant = 'default',
}: {
  label: string;
  name: string | null;
  christianName?: string | null;
  variant?: MobileVariant;
}) {
  if (!name) {
    return (
      <div className="flex items-center gap-3 bg-[#F5F5F4] border border-dashed border-[#D6D3D1] rounded p-3 opacity-50">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#78716C] font-body">{label}</p>
        <p className="text-xs text-[#78716C] font-body italic">Chưa rõ</p>
      </div>
    );
  }

  const styles: Record<MobileVariant, { bg: string; label: string; christian: string }> = {
    default:    { bg: 'bg-surface',      label: 'text-[#78716C]',  christian: 'text-primary' },
    primary:    { bg: 'bg-primary/90',   label: 'text-white/60',   christian: 'text-white/80' },
    descendant: { bg: 'bg-emerald-50',   label: 'text-emerald-600', christian: 'text-emerald-500' },
    spouse:     { bg: 'bg-teal-50',      label: 'text-teal-600',   christian: 'text-teal-500' },
  };

  const s = styles[variant];
  const nameCls = variant === 'primary' ? 'text-white' : 'text-[#1C1917]';

  return (
    <div className={`flex items-center gap-3 rounded p-2 ${s.bg}`}>
      <div className="shrink-0">
        <p className={`text-[9px] font-bold uppercase tracking-widest font-body ${s.label}`}>{label}</p>
      </div>
      <div className="flex-1 min-w-0">
        {christianName && <p className={`text-xs font-display italic leading-none ${s.christian}`}>{christianName}</p>}
        <p className={`font-display font-bold text-sm truncate ${nameCls}`}>{name}</p>
      </div>
    </div>
  );
}
