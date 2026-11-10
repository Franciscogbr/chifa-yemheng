import type { ReactNode } from 'react';

export type EstadoPrep = 'P' | 'L' | 'A';

export interface EstadoBadgeProps {
  estado: EstadoPrep;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const TONE: Record<EstadoPrep, string> = {
  P: '#f59e0b',
  L: '#22c55e',
  A: '#ef4444',
};

const LABEL: Record<EstadoPrep, string> = {
  P: 'Pendiente',
  L: 'Listo',
  A: 'Anulado',
};

const SIZE_STYLES: Record<'sm' | 'md' | 'lg', { padding: string; fontSize: number; showTime: boolean }> = {
  sm: { padding: '2px 8px', fontSize: 11, showTime: false },
  md: { padding: '4px 10px', fontSize: 12, showTime: true },
  lg: { padding: '6px 12px', fontSize: 13, showTime: true },
};

export function EstadoBadge({ estado, size = 'sm', tooltip }: EstadoBadgeProps) {
  const color = TONE[estado] ?? '#6c757d';
  const label = LABEL[estado] ?? estado;
  const s = SIZE_STYLES[size];
  const title = tooltip ? `${label} · ${tooltip}` : label;

  const node: ReactNode = (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: s.padding,
        fontSize: s.fontSize,
        lineHeight: 1.2,
        fontWeight: 600,
        borderRadius: 9999,
        color: '#fff',
        background: color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
  return node;
}
