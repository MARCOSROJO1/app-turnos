import '@/app/globals.css';

export const metadata = {
  title: 'Turnos Tucumán',
  description: 'Gestión de turnos para comercios y profesionales de Tucumán',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}