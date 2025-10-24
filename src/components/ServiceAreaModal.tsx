import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serviceAreas } from "@/lib/mockData";
import { useStore } from "@/lib/store";

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceAreaModal = ({ isOpen, onClose }: ServiceAreaModalProps) => {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const { setSelectedArea: setStoreArea } = useStore();

  const handleConfirm = () => {
    if (selectedArea) {
      setStoreArea(selectedArea);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card rounded-2xl shadow-warm max-w-md w-full p-6"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Select Your Area</h2>
          <p className="text-muted-foreground">
            Choose your delivery location to see available restaurants
          </p>
        </div>

        <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
          {serviceAreas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedArea === area
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`h-5 w-5 ${selectedArea === area ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">{area}</span>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedArea}
          className="w-full"
          size="lg"
        >
          Confirm Location
        </Button>
      </motion.div>
    </div>
  );
};
