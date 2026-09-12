export type EstadoTurno = 'pendiente' | 'confirmado' | 'completado' | 'cancelado';
export type EstadoPago = 'no_requerido' | 'pendiente_sena' | 'sena_pagada';

export interface Negocio {
  id: string;
  nombre: string;
  slug: string;
  telefono_whatsapp: string;
  direccion?: string;
  telefono?: string | null;
  cobrar_sena: boolean;
  monto_sena_fijo: number;
}

export interface Servicio {
  id: string;
  negocio_id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
}

export interface Turno {
  id: string;
  negocio_id: string;
  servicio_id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: EstadoTurno;
  pago_estado: EstadoPago;
}