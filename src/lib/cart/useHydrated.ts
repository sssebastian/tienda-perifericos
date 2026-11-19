'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Devuelve false en el servidor y durante la hidratación, y true en el navegador
 * después de hidratar. Sirve para mostrar datos que solo existen en el cliente
 * (como el carrito guardado en localStorage) sin provocar errores de hidratación.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true, // valor en el cliente
    () => false, // valor en el servidor y durante la hidratación
  );
}
