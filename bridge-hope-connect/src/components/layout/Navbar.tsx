import { Button } from '@/components/ui/button';
import { Heart, LogOut } from 'lucide-react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  showAuth?: boolean;
  title?: string;
  userName?: string;
  onLogin?: () => void;
  onSignup?: () => void;
}

export const Navbar = ({ showAuth = false, title, userName, onLogin, onSignup }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">DonorBridge</h1>
              <p className="text-xs text-muted-foreground">We Are Here To Save You</p>
            </div>
          </div>

          {/* Middle - Title or Tagline */}
          <div className="hidden md:block text-center">
            {title ? (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            ) : (
              <h2 className="text-lg font-medium text-muted-foreground max-w-md">
                Transparent Donation Bridge between Donors, NGOs & Orphanages
              </h2>
            )}
          </div>

          {/* Right - Auth buttons or User info */}
          <div className="flex items-center space-x-3">
            {showAuth ? (
              <>
                <Button variant="outline" onClick={onLogin}>
                  Login
                </Button>
                <Button variant="hero" onClick={onSignup}>
                  Signup
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {userName && (
                  <span className="text-sm font-medium text-foreground">
                    Welcome, {userName}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};