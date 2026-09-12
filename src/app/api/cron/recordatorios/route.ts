import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 1. Calcular el rango de fecha para "Mañana" (desde las 00:00:00 hasta las 23:59:59)
    const hoy = new Date();
    const mananaInicio = new Date(hoy);
    mananaInicio.setDate(mananaInicio.getDate() + 1);
    mananaInicio.setHours(0, 0, 0, 0);

    const mananaFin = new Date(mananaInicio);
    mananaFin.setHours(23, 59, 59, 999);

    const inicioISO = mananaInicio.toISOString();
    const finISO = mananaFin.toISOString();

    // 2. Consultar los turnos de mañana en Supabase filtrando por el rango de fecha_hora
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .gte('fecha_hora', inicioISO)
      .lte('fecha_hora', finISO);

    if (error) throw error;

    if (!turnos || turnos.length === 0) {
      return NextResponse.json({
        message: 'No hay turnos agendados para mañana.',
        rangoBuscado: { inicioISO, finISO }
      });
    }

    const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    const token = process.env.ULTRAMSG_TOKEN;

    let enviados = 0;

    // 3. Enviar mensaje de WhatsApp por cada turno encontrado
    for (const turno of turnos) {
      const nombreCliente = turno.nombre_cliente || 'Cliente';
      const telefono = turno.telefono_cliente || '';

      // Extraer la hora legible (HH:MM) desde fecha_hora
      const fechaObj = new Date(turno.fecha_hora);
      const horaFormateada = fechaObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const mensaje = `Hola ${nombreCliente}, te recordamos tu turno para mañana a las ${horaFormateada} hs. Por favor confirmá o cancelá con anticipación. ¡Te esperamos!`;
      
      // Limpiar teléfono para incluir prefijo internacional si falta
      let telefonoLimpio = String(telefono).replace(/[^0-9]/g, '');
      if (!telefonoLimpio.startsWith('54') && telefonoLimpio.length <= 11) {
        telefonoLimpio = '54' + telefonoLimpio;
      }

      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: token || '',
          to: telefonoLimpio,
          body: mensaje,
        }),
      });

      if (response.ok) {
        enviados++;
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `Se enviaron ${enviados} recordatorios automáticos exitosamente.`,
      turnosEncontrados: turnos.length
    });
  } catch (err: any) {
    console.error('Error en el cron job de recordatorios:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}