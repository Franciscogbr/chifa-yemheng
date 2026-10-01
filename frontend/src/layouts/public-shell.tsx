import { Outlet } from 'react-router-dom';

/** Shell público: /auth/** (login personal, login cliente). Sin sidebar. */
export function PublicShell() {
  return (
    <div className="bg-background text-ink min-h-screen">
      <Outlet />
    </div>
  );
}
