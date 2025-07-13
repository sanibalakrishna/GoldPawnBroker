import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
  showLogout?: boolean;
  rightAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const Header = ({ 
  title, 
  showBackButton = false, 
  backTo = '/', 
  showLogout = true,
  rightAction 
}: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="flex sm:hidden items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(backTo)}
                className="p-2 h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {rightAction && (
              <Button 
                onClick={rightAction.onClick}
                size="sm"
                className="h-10 px-3"
              >
                {rightAction.icon && <span className="mr-1">{rightAction.icon}</span>}
                <span className="hidden xs:inline">{rightAction.label}</span>
              </Button>
            )}
            {showLogout && (
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                size="sm"
                className="p-2 h-10 w-10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(backTo)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {rightAction && (
              <Button 
                onClick={rightAction.onClick}
              >
                {rightAction.icon && <span className="mr-2">{rightAction.icon}</span>}
                {rightAction.label}
              </Button>
            )}
            {showLogout && (
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 