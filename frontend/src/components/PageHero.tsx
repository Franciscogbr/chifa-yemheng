import type { CSSProperties, ElementType, ReactNode } from 'react';
import clsx from 'clsx';

export interface PageHeroStat {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Resalta la tarjeta (por ejemplo, lo que requiere atención inmediata). */
  highlight?: boolean;
}

interface PageHeroProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Id del título; si se indica, la sección queda asociada con aria-labelledby. */
  titleId?: string;
  /** Etiqueta accesible cuando no hay `titleId`. */
  ariaLabel?: string;
  /** Nivel del encabezado. Cada página debe tener un único h1. */
  headingAs?: Extract<ElementType, 'h1' | 'h2' | 'h3'>;
  actions?: ReactNode;
  stats?: PageHeroStat[];
  statsLabel?: string;
  /** URL de una imagen de fondo; activa la variante con foto. */
  image?: string;
  className?: string;
  /** Contenido extra a la derecha del texto (por ejemplo, un resumen o una tarjeta). */
  aside?: ReactNode;
  children?: ReactNode;
}

/**
 * Hero de aplicación ("Application style hero").
 *
 * Reutiliza las clases `y-flow-hero*` para que se vea igual que el resto de
 * pantallas que todavía usan el marcado manual, y añade variantes responsive:
 * foto de fondo, estadísticas y contenido lateral.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  titleId,
  ariaLabel,
  headingAs: Heading = 'h1',
  actions,
  stats,
  statsLabel,
  image,
  className,
  aside,
  children,
}: PageHeroProps) {
  const style = image ? ({ ['--hero-image' as string]: `url("${image}")` } as CSSProperties) : undefined;

  return (
    <section
      className={clsx('y-flow-hero', image && 'y-flow-hero--image', className)}
      aria-labelledby={titleId}
      aria-label={titleId ? undefined : ariaLabel}
      style={style}
    >
      <div className="y-flow-hero__body">
        <div className="y-flow-hero__content">
          <span className="y-flow-hero__eyebrow">{eyebrow}</span>
          <Heading id={titleId} className="y-flow-hero__title">{title}</Heading>
          {description && <p className="y-flow-hero__description">{description}</p>}
          {actions && <div className="y-flow-hero__actions">{actions}</div>}
          {children}
        </div>
        {aside && <div className="y-flow-hero__aside">{aside}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="y-flow-hero__stats" role="group" aria-label={statsLabel}>
          {stats.map((stat) => (
            <div key={stat.label} className={clsx('y-flow-hero__stat', stat.highlight && 'y-flow-hero__stat--highlight')}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              {stat.hint && <small>{stat.hint}</small>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
