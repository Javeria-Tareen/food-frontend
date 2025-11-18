import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Flame, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/lib/mockData";
import { ProductModal } from "./ProductModal";

interface MenuItemCardProps {
  item: MenuItem;
  index?: number;
}

export const MenuItemCard = ({ item, index = 0 }: MenuItemCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = () => {
    setShowModal(true);
  };

  return (
    <>
      <ProductModal 
        item={item} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
      
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-warm transition-all duration-300 border"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {item.isVeg && (
            <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
              <Leaf className="h-3 w-3" />
            </div>
          )}
          {item.isSpicy && (
            <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
              <Flame className="h-3 w-3" />
            </div>
          )}
        </div>
        {item.featured && (
          <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
          <span className="font-bold text-primary whitespace-nowrap">Rs. {item.price}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {item.description}
        </p>

        <Button
          onClick={handleAddToCart}
          className="w-full group-hover:shadow-warm transition-all"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
    </>
  );
};
