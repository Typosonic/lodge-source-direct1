import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lodge-dark-bg">
      <div className="text-center max-w-md px-4">
        <div className="mb-6 inline-block text-lodge-purple text-6xl font-bold">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-white/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GradientButton asChild>
            <Link to="/">Back to Home</Link>
          </GradientButton>
          <GradientButton asChild>
            <Link to="/catalog">Browse Products</Link>
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
