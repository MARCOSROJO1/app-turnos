import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Traemos 1 solo registro sin filtrar por ninguna columna para ver la estructura real de las llaves
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .limit(1);

    if (error) throw error;

    if (!turnos || turnos.length === 0) {
      return NextResponse.json({ 
        message: 'La tabla turnos está vacía actualmente. Crea un turno desde la web para ver las columnas.' 
      });
    }

    // Obtenemos todos los nombres de las columnas que existen en la tabla
    const columnasExistentes = Object.keys(turnos[0]);

    return NextResponse.json({
      mensaje: 'Estructura real de la tabla turnos obtenida exitosamente',
      columnasEncontradas: columnasExistentes,
      ejemploRegistro: turnos[0]
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}