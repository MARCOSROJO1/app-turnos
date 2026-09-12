'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Turno {
  id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  fecha_hora: string;
  estado: string;
}

export default function AdminPage() {
  const [sesion, setSesion] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Estados del formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Estados de los turnos
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setLoadingAuth(false);
      if (session) {
        fetchTurnos();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      if (session) {
        fetchTurnos();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchTurnos() {
    setLoadingTurnos(true);
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener turnos:', error);
    } else if (data) {
      setTurnos(data as Turno[]);
    }
    setLoadingTurnos(false);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorLogin('Correo o contraseña incorrectos.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTurnos([]);
  };

  async function cambiarEstado(id: string, nuevoEstado: string) {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      fetchTurnos();
    }
  }

  async function eliminarTurno(id: string) {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este turno?');
    if (!confirmar) return;

    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTurnos();
    } else {
      alert('Error al eliminar el turno.');
    }
  }

  function enviarWhatsApp(turno: Turno) {
    const fechaObj = new Date(turno.fecha_hora);
    const fechaTexto = fechaObj.toLocaleDateString('es-AR');
    const horaTexto = fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    let numeroLimpio = turno.telefono_cliente.replace(/\D/g, '');

    if (!numeroLimpio.startsWith('549') && numeroLimpio.length <= 10) {
      numeroLimpio = `549${numeroLimpio}`;
    }

    const mensaje = encodeURIComponent(
      `Hola ${turno.nombre_cliente}! 👋 Confirmamos tu turno para el día ${fechaTexto} a las ${horaTexto} hs en Barbería Sur. ¡Te esperamos!`
    );

    window.open(`https://wa.me/${numeroLimpio}?text=${mensaje}`, '_blank');
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Cargando...
      </div>
    );
  }

  // 1. PANTALLA DE LOGIN
  if (!sesion) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Acceso Administrativo</h2>
          <p className="text-xs text-slate-500 text-center mb-6">Iniciá sesión con tu cuenta de Supabase Auth</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@barberia.com"
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {errorLogin && (
              <p className="text-xs text-red-600 text-center font-medium">{errorLogin}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-md"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 2. PANEL DE ADMINISTRACIÓN PROTEGIDO
  return (
    <main className="min-h-screen bg-slate-50 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
          <p className="text-xs text-slate-500">Conectado como: {sesion.user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      {loadingTurnos ? (
        <p className="text-slate-500">Cargando turnos...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border divide-y">
          {turnos.length === 0 ? (
            <p className="p-6 text-slate-500 text-center">No hay turnos registrados aún.</p>
          ) : (
            turnos.map((turno) => (
              <div key={turno.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <p className="font-bold text-slate-800">{turno.nombre_cliente}</p>
                  <p className="text-xs text-slate-500">📞 {turno.telefono_cliente}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    📅 {new Date(turno.fecha_hora).toLocaleString('es-AR')} hs
                  </p>
                </div>
                
                <div className="flex gap-2 items-center flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    turno.estado === 'confirmado' 
                      ? 'bg-green-100 text-green-700' 
                      : turno.estado === 'cancelado' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {turno.estado || 'pendiente'}
                  </span>

                  {turno.estado !== 'confirmado' && (
                    <button
                      onClick={() => {
                        cambiarEstado(turno.id, 'confirmado');
                        enviarWhatsApp(turno);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Confirmar
                    </button>
                  )}

                  {turno.estado !== 'cancelado' && (
                    <button
                      onClick={() => cambiarEstado(turno.id, 'cancelado')}
                      className="px-3 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    onClick={() => eliminarTurno(turno.id)}
                    className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-xs hover:bg-red-100 transition-colors"
                    title="Eliminar de la base de datos"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}