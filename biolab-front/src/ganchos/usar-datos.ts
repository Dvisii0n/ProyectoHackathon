import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------
// Carga datos de un servicio y expone { datos, cargando, error, recargar }.
// Ejemplo: const { datos } = useDatos(() => obtenerReportes(), []);
// ----------------------------------------------------------------------

export function useDatos<T>(cargar: () => Promise<T>, dependencias: React.DependencyList = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    cargar()
      .then((resultado) => {
        if (!cancelado) setDatos(resultado);
      })
      .catch((e: unknown) => {
        if (!cancelado) setError(e instanceof Error ? e.message : 'Algo salió mal');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { datos, setDatos, cargando, error, recargar };
}

/** Cuenta de 0 al valor final en ~900 ms (para los números del panel). */
export function useConteo(final: number, duracion = 900) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const inicio = performance.now();
    let cuadro = 0;

    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suavizado = 1 - (1 - t) ** 3;
      setValor(Math.round(final * suavizado));
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [final, duracion]);

  return valor;
}
