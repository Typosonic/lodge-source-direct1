import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import CartMenu from "@/components/cart/CartMenu";
import { useQuery } from "@tanstack/react-query";
import { getUserWalletBalance } from "@/services/transactionService";
import { GradientButton } from "@/components/ui/gradient-button";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigateToAuth = () => {
    navigate('/auth');
  };

  // Fetch wallet balance for logged-in user
  const { data: walletBalance = 0 } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: getUserWalletBalance,
    enabled: !!user,
    refetchInterval: 10000, // update every 10s
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-lodge-dark-bg/80 backdrop-blur-md border-b border-white/10 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-gradient font-bold text-2xl">1:1 LODGE</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white/80 hover:text-lodge-purple transition-colors">
              Home
            </Link>
            <Link to="/catalog" className="text-white/80 hover:text-lodge-purple transition-colors">
              Products
            </Link>
            <Link to="/orders" className="text-white/80 hover:text-lodge-purple transition-colors">
              My Orders
            </Link>
            {user && (
              <Link to="/dashboard" className="text-white/80 hover:text-lodge-purple transition-colors">
                Dashboard
              </Link>
            )}
            {user && (
              <Link to="/wallet" className="text-white/80 hover:text-lodge-purple transition-colors">
                Wallet
              </Link>
            )}
            {user && user.email === "jordancamp4270@gmail.com" && (
              <Link to="/admin" className="text-white/80 hover:text-lodge-purple transition-colors">
                Admin Panel
              </Link>
            )}
            {user && (
              <Link to="/profile" className="text-white/80 hover:text-lodge-purple transition-colors">
                Profile
              </Link>
            )}
            <div className="flex items-center gap-2">
              {/* Wallet Balance */}
              {user && (
                <span className="text-lodge-purple font-bold text-sm bg-lodge-card-bg/60 px-3 py-1 rounded-full border border-lodge-purple/30 mr-2">
                  ${walletBalance.toFixed(2)}
                </span>
              )}
              <CartMenu />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 hover:bg-lodge-purple/20"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>{user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-lodge-card-bg border-white/10 text-white">
                    <DropdownMenuItem 
                      onClick={() => navigate('/wallet')}
                      className="cursor-pointer hover:bg-lodge-purple/20"
                    >
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/orders')}
                      className="cursor-pointer hover:bg-lodge-purple/20"
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer hover:bg-lodge-purple/20"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer hover:bg-lodge-purple/20 text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <GradientButton
                  className="bg-lodge-purple hover:bg-lodge-dark-purple text-white px-6 button-glow"
                  onClick={navigateToAuth}
                >
                  Sign In
                </GradientButton>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <CartMenu />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-lodge-dark-bg/95 backdrop-blur-md border-b border-white/10 animate-fade-in">
          <div className="container mx-auto p-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-white/80 hover:text-lodge-purple transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/catalog" 
              className="text-white/80 hover:text-lodge-purple transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/orders" 
              className="text-white/80 hover:text-lodge-purple transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              My Orders
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="text-white/80 hover:text-lodge-purple transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/profile"
                className="text-white/80 hover:text-lodge-purple transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/wallet"
                  className="text-white/80 hover:text-lodge-purple transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Wallet
                </Link>
                {user.email === "jordancamp4270@gmail.com" && (
                  <Link
                    to="/admin"
                    className="text-white/80 hover:text-lodge-purple transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="flex justify-start items-center gap-2 text-red-400"
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <GradientButton
                className="bg-lodge-purple hover:bg-lodge-dark-purple text-white px-6 button-glow"
                onClick={() => {
                  navigateToAuth();
                  setIsOpen(false);
                }}
              >
                Sign In
              </GradientButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
