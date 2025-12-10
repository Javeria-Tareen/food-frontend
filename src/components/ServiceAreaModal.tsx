// src/components/ServiceAreaModal.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useAreaStore } from "@/lib/areaStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

interface Area {
  _id: string;
  name: string;
  city: string;
}

export default function ServiceAreaModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const { setSelectedArea: setSelectedAreaStore } = useAreaStore();

  useEffect(() => {
    if (!isOpen) {
      setSelectedArea(null);
      return;
    }

    const loadAreas = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ areas: Area[] }>("/areas");
        setAreas(response.areas);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load delivery areas");
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedArea) return;

    const payload = {
      id: selectedArea._id,
      name: selectedArea.name,
      city: selectedArea.city,
      fullAddress: `${selectedArea.name}, ${selectedArea.city}`,
      deliveryFee: 199,
      estimatedTime: "30-45 min",
    };

    setSelectedAreaStore(payload);
    sessionStorage.setItem("areaChecked", "true");
    toast.success(`Delivering to ${selectedArea.name}!`);
    navigate(`/menu/area/${selectedArea._id}`);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 z-[9999] max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-card rounded-3xl shadow-2xl overflow-hidden border border-border"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-start">
              <div>
                <Dialog.Title className="text-2xl font-bold flex items-center gap-3">
                  <MapPin className="h-8 w-8" />
                  Select Delivery Area
                </Dialog.Title>
                <Dialog.Description className="text-green-100 mt-1">
                  Choose where you want food delivered
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="p-6 max-h-96">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading areas...</p>
                </div>
              ) : areas.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No delivery areas yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    We're expanding soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6 overflow-y-auto max-h-80">
                  {areas.map((area) => (
                    <button
                      key={area._id}
                      onClick={() => setSelectedArea(area)}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        selectedArea?._id === area._id
                          ? "border-green-500 bg-green-50 shadow-lg"
                          : "border-border hover:border-green-300 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full ${
                            selectedArea?._id === area._id
                              ? "bg-green-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <MapPin
                            className={`h-6 w-6 ${
                              selectedArea?._id === area._id
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{area.name}</p>
                          <p className="text-sm text-muted-foreground">{area.city}</p>
                        </div>
                      </div>
                      {selectedArea?._id === area._id && (
                        <Check className="h-6 w-6 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!selectedArea || loading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                {selectedArea
                  ? `Deliver to ${selectedArea.name}`
                  : "Please select an area"}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Delivery fee: Rs.199 • 30-45 min
              </p>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
