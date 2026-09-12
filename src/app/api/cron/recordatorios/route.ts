import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 1. Obtener la fecha de mañana (YYYY-MM-DD)
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split('T')[0];

    // 2. Buscar en Supabase los turnos de mañana
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('fecha_turno', fechaManana);

    if (error) throw error;

    if (!turnos || turnos.length === 0) {
      return NextResponse.json({ message: 'No hay turnos agendados para mañana.' });
    }

    const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    const token = process.env.ULTRAMSG_TOKEN;

    let enviados = 0;

    // 3. Recorrer los turnos y enviar recordatorio por WhatsApp
    for (const turno of turnos) {
      const mensaje = `Hola ${turno.nombre}, te recordamos tu turno para mañana a las ${turno.hora} hs. Por favor confirmá o cancelá con anticipación. ¡Te esperamos!`;
      const telefonoLimpio = turno.telefono.replace(/[^0-9]/g, '');

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
    });
  } catch (err: any) {
    console.error('Error en el cron job de recordatorios:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}