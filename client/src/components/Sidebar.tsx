import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  IndianRupee, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Cookies from 'js-cookie';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Particulars',
    href: '/particulars',
    icon: Users,
    description: 'Manage clients'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: IndianRupee,
    description: 'Financial records'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

const Sidebar = ({ isOpen, onToggle, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    Cookies.remove('token');
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // On mobile, always w-64. On desktop, w-16 or w-64 based on isCollapsed.
  const sidebarWidth = isCollapsed ? 'lg:w-16' : 'lg:w-64';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        h-screen overflow-y-auto bg-card border-r border-border/50
        transition-all duration-300 ease-in-out
        w-64 fixed top-0 left-0 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed ${sidebarWidth}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-foreground">PawnBroker</h1>
                  <p className="text-xs text-muted-foreground">Gold & Silver</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex h-8 w-8 p-0"
              >
                {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Button
                  key={item.name}
                  variant={active ? "secondary" : "ghost"}
                  className={`
                    w-full justify-start h-12 px-3
                    ${active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted/50'}
                    ${isCollapsed ? 'px-2' : 'px-3'}
                    transition-all duration-200
                  `}
                  onClick={() => {
                    navigate(item.href);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground hidden xl:block">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border/50">
            <Button
              variant="ghost"
              className={`
                w-full justify-start h-12 px-3 text-destructive hover:text-destructive hover:bg-destructive/10
                ${isCollapsed ? 'px-2' : 'px-3'}
              `}
              onClick={handleLogout}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 