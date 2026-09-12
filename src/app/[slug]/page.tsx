import { supabase } from '@/lib/supabase';
import { Negocio, Servicio } from '@/types';
import ListaServicios from '@/components/ListaServicios';

interface Props {
  params: {
    slug: string;
  };
}

async function getNegocioData(slug: string) {
  // Consulta directa a Supabase
  const { data: negocio, error } = await supabase
    .from('negocios')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.log('🔴 Error al consultar Supabase:', error);
    return null;
  }

  if (!negocio) {
    console.log(`⚠️ No se encontró ningún negocio con slug: "${slug}"`);
    return null;
  }

  const { data: servicios, error: errorServicios } = await supabase
    .from('servicios')
    .select('*')
    .eq('negocio_id', negocio.id);

  if (errorServicios) {
    console.log('🔴 Error al obtener servicios:', errorServicios);
  }

  return {
    negocio: negocio as Negocio,
    servicios: (servicios || []) as Servicio[],
  };
}

export default async function NegocioPage({ params }: Props) {
  const data = await getNegocioData(params.slug);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md border text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Negocio no encontrado</h1>
          <p className="text-sm text-slate-600">
            No se encontró ningún negocio con el slug: <span className="font-mono font-bold text-slate-800">"{params.slug}"</span>.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Revisá la terminal de VS Code para ver la salida del diagnóstico.
          </p>
        </div>
      </main>
    );
  }

  const { negocio, servicios } = data;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800">{negocio.nombre}</h1>
          <p className="text-slate-500 mt-1">{negocio.direccion || 'Tucumán'}</p>
          {negocio.telefono && (
            <p className="text-sm text-slate-400 mt-2">📞 {negocio.telefono}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Servicios Disponibles</h2>
          <ListaServicios servicios={servicios} />
        </div>
      </div>
    </main>
  );
}
export const revalidate = 0;
export const dynamic = 'force-dynamic';

