import type { AnimoCapi } from 'src/tipos/dominio';

import { useMemo, useState, useContext, createContext } from 'react';

// ----------------------------------------------------------------------
// Estado compartido de Capi entre pantallas.
// `animoSimulado` sirve para la demo ("Simular semana con daños" en el panel);
// en producción el ánimo viene del back en GET /racha.
// ----------------------------------------------------------------------

type ValorMascota = {
  animoSimulado: AnimoCapi | null;
  simularAnimo: (animo: AnimoCapi | null) => void;
};

const ContextoMascota = createContext<ValorMascota | null>(null);

export function ProveedorMascota({ children }: { children: React.ReactNode }) {
  const [animoSimulado, simularAnimo] = useState<AnimoCapi | null>(null);
  const valor = useMemo(() => ({ animoSimulado, simularAnimo }), [animoSimulado]);
  return <ContextoMascota.Provider value={valor}>{children}</ContextoMascota.Provider>;
}

export function useMascota(): ValorMascota {
  const contexto = useContext(ContextoMascota);
  if (!contexto) throw new Error('useMascota debe usarse dentro de <ProveedorMascota>');
  return contexto;
}
