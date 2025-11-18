import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Flame, Leaf } from "lucide-react";
import { MenuItem } from "@/lib/mockData";
import { useStore, AddOn } from "@/lib/store";
import { toast } from "sonner";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ADDONS: AddOn[] = [
  { id: "raita", name: "Raita", price: 50 },
  { id: "salad", name: "Salad", price: 40 },
  { id: "cold_drink", name: "Cold Drink", price: 80 },
];

export const ProductModal = ({ item, isOpen, onClose }: ProductModalProps) => {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const addToCart = useStore((state) => state.addToCart);

  if (!item) return null;

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    const addOnsTotal = selectedAddOns.reduce((sum, addOnId) => {
      const addOn = AVAILABLE_ADDONS.find((a) => a.id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);
    return item.price + addOnsTotal;
  };

  const handleAddToCart = () => {
    const selectedAddOnDetails = AVAILABLE_ADDONS.filter((addon) =>
      selectedAddOns.includes(addon.id)
    );

    addToCart(item, selectedAddOnDetails);
    
    const addOnsText = selectedAddOnDetails.length > 0 
      ? ` with ${selectedAddOnDetails.map(a => a.name).join(", ")}`
      : "";
    
    toast.success(`${item.name}${addOnsText} added to cart!`);
    setSelectedAddOns([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add to Cart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative overflow-hidden rounded-lg aspect-video">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
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
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-xl">{item.name}</h3>
              <span className="font-bold text-primary text-lg whitespace-nowrap">
                Rs. {item.price}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          {/* Add-ons Section */}
          <div>
            <h4 className="font-semibold mb-3">Add-ons (Optional)</h4>
            <div className="space-y-3">
              {AVAILABLE_ADDONS.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={addOn.id}
                      checked={selectedAddOns.includes(addOn.id)}
                      onCheckedChange={() => handleAddOnToggle(addOn.id)}
                    />
                    <label
                      htmlFor={addOn.id}
                      className="font-medium cursor-pointer"
                    >
                      {addOn.name}
                    </label>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    +Rs. {addOn.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total and Add Button */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-primary">Rs. {calculateTotal()}</span>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
