import type { ClientesMesaResponse } from './mesas-types';

const ICON_POR_TIPO_DOC: Record<string, string> = {
  DNI: 'badge',
  RUC: 'receipt',
  CE: 'person',
  PAS: 'passport',
};

const MODO_LABEL: Record<string, { label: string; color: string }> = {
  CUENTA_UNICA: { label: 'Cuenta única', color: '#A61E22' },
  POR_CONSUMO: { label: 'Pago por consumo', color: '#2563EB' },
};

export function ClientesHero({
  data,
  mesaNumero,
  onEditarCliente,
}: {
  data: ClientesMesaResponse;
  mesaNumero: string;
  onEditarCliente?: (clienteId: number) => void;
}) {
  const { modoPagoMesa, totalComanda, clientes } = data;
  const esCuentaUnica = modoPagoMesa === 'CUENTA_UNICA';
  const modoInfo = MODO_LABEL[modoPagoMesa];

  if (!clientes || clientes.length === 0) {
    return (
      <section className="rounded-xl bg-[#F5F5F5] p-6 shadow-sm border border-[#F5F5F5]/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#7F1518]">Clientes en la mesa</h2>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${modoInfo.color === '#A61E22' ? 'bg-[#A61E22]/15 text-[#A61E22]' : 'bg-[#2563EB]/15 text-[#2563EB]'}`}>
            <span className="material-symbols-outlined text-[10px]">payment</span>
            {modoInfo.label}
          </span>
        </div>
        <div className="rounded-lg bg-white p-4 text-center text-sm text-[#333333]/60">
          Sin clientes registrados en esta comanda.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm border border-[#F5F5F5]/50">
      {/* Hero header */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#5b1014] via-[#8f191e] to-[#a61e22] p-5 text-[#fffaf0] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-24 h-56 w-56 rounded-full border border-[#ffdfa0]/20" />
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#fffaf0]/15 text-[#ffdfa0]`}>
                <span className="material-symbols-outlined text-[10px]">payment</span>
                {modoInfo.label}
              </span>
              <span className="text-xs text-[#fffaf0]/70 uppercase tracking-wider ml-2">
                Mesa {mesaNumero}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold text-[#fffaf0] sm:text-3xl">S/. {totalComanda.toFixed(2)}</span>
              <span className="text-xs text-[#fffaf0]/70 uppercase tracking-wider">
                Total de la comanda
              </span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#fffaf0]">
            {esCuentaUnica ? 'Un solo pago' : 'Pago repartido'}
          </h2>
          <p className="text-[#fffaf0]/80 mt-1">
            {esCuentaUnica
              ? `${clientes.length} persona${clientes.length !== 1 ? 's' : ''} en la mesa, se cobra todo a una sola cuenta.`
              : `${clientes.length} persona${clientes.length !== 1 ? 's' : ''} comparten el consumo. Cada uno paga lo que consumió.`}
          </p>
        </div>
      </div>

      {/* Tarjetas de clientes */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${esCuentaUnica ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4`}>
        {clientes.map((cliente) => {
          const esOrganizador = cliente.esOrganizador;
          const tipoDocIcon = ICON_POR_TIPO_DOC[cliente.tipoDocumento] || 'badge';
          const porcentaje =
            totalComanda > 0
              ? Math.max(5, (cliente.consumoEstimado / totalComanda) * 100)
              : 0;

          return (
            <article
              key={cliente.clienteId}
              className={`rounded-xl p-4 border shadow-sm hover:shadow-md transition-all ${
                esOrganizador
                  ? 'border-[#A61E22] bg-[#F5F0EF]'
                  : 'border-[#F5F5F5] bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full p-1.5 ${
                      esOrganizador ? 'bg-[#A61E22]/15 text-[#A61E22]' : 'bg-[#22C55E]/15 text-[#22C55E]'
                    }`}
                    title={esOrganizador ? 'Organizador de la comanda' : 'Participante'}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {esOrganizador ? 'person_pin' : 'person'}
                    </span>
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    esOrganizador ? 'text-[#A61E22]' : 'text-[#22C55E]'
                  }`}>
                    {esOrganizador ? 'ORGANIZADOR' : 'PARTICIPANTE'}
                  </span>
                </div>
                {!esCuentaUnica && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      esOrganizador ? 'bg-[#A61E22]/15 text-[#A61E22]' : 'bg-[#22C55E]/15 text-[#22C55E]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[10px]">{tipoDocIcon}</span>
                    {cliente.tipoDocumento}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[#7F1518] leading-tight">
                {cliente.nombre}
              </h3>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#333333]/40">
                    badge
                  </span>
                  <span className="font-medium text-[#333333]">{cliente.documento || '—'}</span>
                </div>

                {esCuentaUnica ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[16px] text-[#333333]/40">
                      payment
                    </span>
                    <span className="font-medium text-[#333333]">
                      Comparte cuenta única
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[16px] text-[#333333]/40">
                      attach_money
                    </span>
                    <span className="font-bold text-[#A61E22]">
                      S/. {cliente.consumoEstimado.toFixed(2)}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold text-[#333333]/50">
                      {porcentaje.toFixed(0)}% del total
                    </span>
                  </div>
                )}
              </div>

              {!esCuentaUnica && cliente.consumoEstimado > 0 && totalComanda > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-[#F5F5F5] rounded-full h-1.5">
                    <div
                      className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Nota informativa */}
      <div className={`mt-6 rounded-lg p-3 ${
        esCuentaUnica ? 'bg-[#F5F0EF] border border-[#A61E22]/30' : 'bg-[#EFF6FF] border border-[#2563EB]/30'
      }`}>
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-[14px] mt-0.5 ${
            esCuentaUnica ? 'text-[#A61E22]' : 'text-[#2563EB]'
          }">
            {esCuentaUnica ? 'receipt_long' : 'scatter_plot'}
          </span>
          <div>
            <p className={`text-sm font-bold ${esCuentaUnica ? 'text-[#A61E22]' : 'text-[#2563EB]'}`}>
              {esCuentaUnica ? 'Cobro único' : 'Cobro individual'}
            </p>
            <p className="text-xs text-[#333333]/60">
              {esCuentaUnica
                ? 'El monto total se cobra en una sola cuenta. El organizador es el responsable del pago.'
                : 'Cada cliente paga su consumo estimado. El monto se reparte proporcionalmente según lo consumido.'}
            </p>
          </div>
        </div>
      </div>

      {/* Acción rápida */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-xs text-[#333333]/50 uppercase tracking-wider font-semibold">
          Acción rápida
        </span>
        {onEditarCliente && clientes.length > 0 && (
          <button
            type="button"
            onClick={() => onEditarCliente(clientes[0].clienteId)}
            className="rounded-lg bg-[#2563EB]/10 px-4 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#2563EB]/20"
          >
            Gestionar clientes
          </button>
        )}
      </div>
    </section>
  );
}
