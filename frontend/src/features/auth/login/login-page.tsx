import { LoginForm } from './login-form';

const HERO_DESKTOP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDdpvRbBfy9QhGlE5hQWpJITIEoFiEVY6whR9KXIepyL3PstSuC1J8sN7_wzB-SjBUMt80himR-Cg7zNCpWUt59HFL_SDh214mySl_pokZNwUNCJ2dsgjBteFWuC_R2YIEPzKRGkV5J9aaz-xcwZONMmLtmk7z75sYRY-sTqZC8wKPV72LBlATQGwKiJSTqTzrxJJS6_JfUPHQOAq6TnIHYajt6XZqfdNGeKXFjNWcf8lJ3QTymJxfccw';
const HERO_MOBILE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAnFRgUItmocmQX1af2vV0ApyS6y_yVcbk5bqyy9BLb0YTZziFKFsHn3z_ad6iw3eIV2qelnH4cgIT-nX7qGKpr_mRGMukhT4dBFHsK3jPkQZ8tYtt1pmuHgVhG7SCJwrNzkPwIGERbGHdxqrrhKvNEgTBCoRPE3vjvNh3BF3zMVLDCbfxaj0LS_QISVxnSlh4qlboFt_6nqwTlTQgv5dv3v3vYIOUJ5CfuP5cCm6vSPfVvNfFvU9p8yEuw';
const SELLO = '/img/sello-yemheng.svg';

/**
 * /auth/login — Login del Personal (login.md), diseño Yemheng Stitch.
 * Responsive mobile-first: base = diseño móvil, lg: = split hero desktop.
 * Sin "Acceso Rápido por Rol" (credenciales hardcodeadas eliminadas por seguridad).
 */
export function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0e0705] font-[Plus_Jakarta_Sans] text-[#ffdf9a] antialiased selection:bg-[#b91c1c] selection:text-white">
      {/* Fondo hero full-bleed (móvil usa HERO_MOBILE vía <picture>) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#120806] via-[#1b0808] to-[#0b0504]">
        <picture>
          <source media="(min-width: 1024px)" srcSet={HERO_DESKTOP} />
          <img
            alt="Cocina Chifa Yemheng"
            src={HERO_MOBILE}
            className="h-full w-full scale-105 object-cover object-center brightness-[0.78] contrast-[1.08] saturate-[1.12] lg:object-[45%_35%]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0502]/85 via-[#120902]/60 to-[#0a0502]/95 lg:bg-gradient-to-r lg:from-[#0d0504]/95 lg:via-[#190606]/65 lg:to-[#090302]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0604] via-transparent to-[#1a0707]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(185,28,28,0.22)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-5 py-5 select-none lg:max-w-7xl lg:px-14 lg:py-8">
        {/* Header marca */}
        <header className="flex w-full items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#1e0a08]/80 p-0.5 shadow-[0_0_20px_rgba(217,119,7,0.3)] ring-2 ring-[#d97707]/60 backdrop-blur-md">
              <img
                alt="Yemheng Chifa Tradicional Sello Oficial"
                src={SELLO}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#ffdcc3] uppercase">
                Yemheng <span className="font-[Newsreader] text-xs font-normal tracking-normal text-[#d97707] italic">益恒</span>
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#e4beb9]/70 uppercase">
                Chifa Tradicional · Lima
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-2.5 rounded-full border border-[#d97707]/30 bg-[#1b0e0a]/75 px-3.5 py-1.5 text-xs text-[#ffdcc3] shadow-lg backdrop-blur-md sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-[11px] font-semibold tracking-wider text-[#ffb77d] uppercase">Portal Operativo</span>
          </div>
        </header>

        {/* Centro: narrativa hero (solo desktop) + tarjeta */}
        <div className="my-auto grid w-full grid-cols-1 items-center gap-8 py-4 lg:grid-cols-12 lg:gap-12 lg:py-6">
          <div className="hidden flex-col justify-center space-y-6 text-left lg:col-span-6 lg:flex xl:col-span-7 lg:pr-6">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#b91c1c]/40 bg-[#3d1210]/60 px-3.5 py-1 backdrop-blur-md">
              <span className="font-[Newsreader] text-base text-[#ffdcc3]">益 恒</span>
              <span className="h-1 w-1 rounded-full bg-[#d97707]" />
              <span className="text-xs font-semibold tracking-widest text-[#ffb77d] uppercase">En servicio</span>
            </div>
            <div className="space-y-3">
              <h1 className="font-[Epilogue] text-4xl font-bold tracking-tight text-[#fff2e0] xl:text-5xl">
                Que no se apague <br />
                <span className="font-[Newsreader] font-normal text-[#ffb77d] italic drop-shadow-[0_2px_12px_rgba(217,119,7,0.35)]">
                  el fuego
                </span>
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-[#e4beb9]/90 sm:text-base">
                Del primer pedido al último cobro: sigue el ritmo del salón aquí y
                ahora, sin perder un plato.
              </p>
            </div>
            <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-[#5b403d]/40 bg-[#25100d]/70 p-3 shadow-md backdrop-blur-md">
                <span className="material-symbols-outlined rounded bg-[#b91c1c]/30 p-1.5 text-2xl text-[#ffb77d]">
                  table_restaurant
                </span>
                <div>
                  <div className="text-xs font-semibold tracking-wide text-[#ffdcc3] uppercase">Salón en llamas</div>
                  <div className="text-[11px] text-[#e4beb9]/70">Ocupación y tiempos</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#5b403d]/40 bg-[#25100d]/70 p-3 shadow-md backdrop-blur-md">
                <span className="material-symbols-outlined rounded bg-[#b91c1c]/30 p-1.5 text-2xl text-[#ffb77d]">
                  room_service
                </span>
                <div>
                  <div className="text-xs font-semibold tracking-wide text-[#ffdcc3] uppercase">Despacho exacto</div>
                  <div className="text-[11px] text-[#e4beb9]/70">Cada plato a su mesa</div>
                </div>
              </div>
            </div>
            <div className="border-l-2 border-[#d97707]/60 pl-3.5 font-[Newsreader] text-sm text-[#ffdcc3]/80 italic">
              "Aquí nadie trabaja solo: cada rol sostiene el servicio."
            </div>
          </div>

          <div className="flex w-full justify-center lg:col-span-6 lg:justify-end xl:col-span-5">
            <div className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#180907]/85 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#b91c1c] via-[#d97707] to-[#b91c1c]" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#ffb77d] uppercase">
                    <span className="material-symbols-outlined text-sm text-[#d97707]">lock</span>
                    Portal de Gestión
                  </span>
                  <span className="rounded-full border border-[#d97707]/50 bg-[#d97707]/15 px-2 py-0.5 font-mono text-[10px] text-[#ffb77d]">
                    ACCESO INTERNO
                  </span>
                </div>
                <h2 className="font-[Epilogue] text-2xl font-bold tracking-tight text-[#fff4e8]">Iniciar Sesión</h2>
                <p className="text-xs text-[#e4beb9]/75">Acceso seguro al sistema de servicio y cocina</p>
              </div>
              <LoginForm />
              <div className="pt-1 text-center">
                <p className="text-xs text-[#e4beb9]/70">
                  ¿No tienes una cuenta asignada?
                  <span className="ml-1 font-medium text-[#ffb77d]">Contactar al Administrador</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex w-full flex-col items-center justify-between gap-2 border-t border-[#5b403d]/30 pt-4 pb-2 text-xs text-[#e4beb9]/60 sm:flex-row">
          <p>© 2025 Chifa Yemheng. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-[#ffb77d]/90">
                <span className="material-symbols-outlined text-sm text-[#d97707]">group</span>
                Uso interno · Toda acción queda auditada
              </span>
            </div>
        </footer>
      </div>
    </div>
  );
}
