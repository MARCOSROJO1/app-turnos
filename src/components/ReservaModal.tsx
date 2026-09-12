'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Servicio } from '@/types';

interface Props {
  servicio: Servicio;
  onClose: () => void;
}

export default function ReservaModal({ servicio, onClose }: Props) {
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const fechaHora = `${fecha}T${hora}:00`;

    // 1. Verificar si ya existe un turno agendado en ese horario
    const { data: turnosExistentes, error: checkError } = await supabase
      .from('turnos')
      .select('id')
      .eq('fecha_hora', fechaHora)
      .neq('estado', 'cancelado');

    if (checkError) {
      console.error('Error al verificar disponibilidad:', checkError);
    }

    if (turnosExistentes && turnosExistentes.length > 0) {
      setMensaje('❌ Ese horario ya se encuentra ocupado. Por favor elegí otra hora o fecha.');
      setLoading(false);
      return;
    }

    // 2. Insertar el turno si el horario está libre
    const { error } = await supabase.from('turnos').insert([
      {
        servicio_id: servicio.id,
        negocio_id: servicio.negocio_id,
        nombre_cliente: nombreCliente,
        telefono_cliente: telefonoCliente,
        fecha_hora: fechaHora,
        estado: 'pendiente',
      },
    ]);

    setLoading(false);

    if (error) {
      setMensaje('❌ Error al agendar el turno. Intentalo de nuevo.');
    } else {
      setMensaje('✅ ¡Turno reservado con éxito!');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Reservar: {servicio.nombre}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        {mensaje ? (
          <p className="text-center py-6 font-medium text-slate-700">{mensaje}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombre completo:
              </label>
              <input
                type="text"
                required
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Teléfono / WhatsApp:
              </label>
              <input
                type="tel"
                required
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fecha:
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Hora:
                </label>
                <input
                  type="time"
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}