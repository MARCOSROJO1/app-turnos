'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim()) {
      router.push(`/${slug.trim().toLowerCase()}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📅</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Turnos Tucumán
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Reservá tu turno en tu comercio de confianza de forma rápida.
        </p>

        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Identificador del negocio (Slug):
            </label>
            <input
              type="text"
              placeholder="barberia-sur"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20"
          >
            Ir al local
          </button>
        </form>
      </div>
    </main>
  );
}