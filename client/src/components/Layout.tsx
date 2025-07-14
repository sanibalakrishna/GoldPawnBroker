import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Margin is 64 when expanded, 16 when collapsed (on desktop)
  const mainMargin = isCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top header with menu and logo */}
      <div className="block lg:hidden bg-card border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center space-x-3 px-4 py-3">
          <button
            className="p-2 rounded-md bg-card border border-border/50 shadow-lg"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">P</span>
            </div>
            <span className="font-bold text-lg text-foreground">PawnBroker</span>
          </div>
        </div>
      </div>

      {/* Sidebar: pass isCollapsed and setIsCollapsed */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content: margin depends on collapse state */}
      <main className={`min-h-screen transition-all duration-300 ease-in-out ${mainMargin}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
