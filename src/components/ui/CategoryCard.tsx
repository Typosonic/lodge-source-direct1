
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: string;
  to: string;
  className?: string;
}

const CategoryCard = ({ title, description, icon, to, className }: CategoryCardProps) => {
  return (
    <Link to={to}>
      <div 
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/10 p-6 hover-scale group glass-card",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-lodge-purple/20 flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-xl group-hover:text-lodge-purple transition-colors">
              {title}
            </h3>
            <p className="text-sm text-white/60">{description}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-lodge-purple to-lodge-accent w-0 group-hover:w-full transition-all duration-300"></div>
      </div>
    </Link>
  );
};

export default CategoryCard;
