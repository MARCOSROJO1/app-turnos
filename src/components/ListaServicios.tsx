'use client';

import { useState } from 'react';
import { Servicio } from '@/types';
import ReservaModal from './ReservaModal';

interface Props {
  servicios: Servicio[];
}

export default function ListaServicios({ servicios }: Props) {
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  if (servicios.length === 0) {
    return <p className="text-slate-500 text-sm">No hay servicios registrados aún.</p>;
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {servicios.map((servicio) => (
          <div key={servicio.id} className="py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{servicio.nombre}</h3>
              <p className="text-xs text-slate-400">{servicio.duracion_minutos} minutos</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700">${servicio.precio}</span>
              <button
                onClick={() => setServicioSeleccionado(servicio)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>

      {servicioSeleccionado && (
        <ReservaModal
          servicio={servicioSeleccionado}
          onClose={() => setServicioSeleccionado(null)}
        />
      )}
    </>
  );
}