// src/pages/Index.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { toast } from "sonner";

import Home from "./Home";
import AreaChecker from "@/components/AreaChecker";
import ServiceAreaModal from "@/components/ServiceAreaModal";
import { useAreaStore } from "@/lib/areaStore";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { Area } from "@/types/area";
interface SelectedArea {
  id: string;
  fullAddress: string;
  name: string;
  city: string;
  centerLatLng: { lat: number; lng: number };
  // Add more fields if needed by your store
}

export default function Index() {
  const navigate = useNavigate();
  const { selectedArea, setSelectedArea } = useAreaStore();
  const [showChecker, setShowChecker] = useState(false);
  const [showAreaList, setShowAreaList] = useState(false);

  const { data: areas = [] } = useQuery<Area[]>({
    queryKey: ["areas"],
    queryFn: async () => {
      const res = await apiClient.get<{ areas: Area[] }>("/areas");
      return res.areas || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Show area checker only once per session
  useEffect(() => {
    const hasChecked = sessionStorage.getItem("areaChecked") === "true";
    if (!selectedArea && !hasChecked && areas.length > 0) {
      setShowChecker(true);
    }
  }, [selectedArea, areas]);

  const openChecker = () => {
    setSelectedArea(null);
    sessionStorage.removeItem("areaChecked");
    setShowChecker(true);
    setShowAreaList(false);
  };



  const handleAreaConfirmed = (areaData: any) => {
    const selectedAreaData: SelectedArea = {
      id: areaData._id,
      fullAddress: areaData.fullAddress || `${areaData.name}, ${areaData.city}`,
      name: areaData.name,
      city: areaData.city,
      centerLatLng: areaData.centerLatLng || areaData.center,
    };
    
    setSelectedArea(selectedAreaData);
    sessionStorage.setItem("areaChecked", "true");
    setShowChecker(false);
    toast.success(`Delivering to ${areaData.name}!`);
    
    // FIXED: Now goes to the correct area menu!
    navigate(`/menu/area/${areaData._id}`);
  };

  const handleNotInService = () => {
    setShowChecker(false);
    setShowAreaList(true);
  };

  return (
    <>
      {/* Area Checker Modal */}
      <AnimatePresence>
        {showChecker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <button
                onClick={() => setShowChecker(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                aria-label="Close Area Checker"
              >
                <X className="h-8 w-8" />
              </button>

              <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-10 w-10" />
                    <div>
                      <h2 className="text-2xl font-bold">Where should we deliver?</h2>
                      <p className="text-green-100">Let us know your location</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <AreaChecker
                    onConfirmed={handleAreaConfirmed}
                    onNotInService={handleNotInService}
                    onClose={() => setShowChecker(false)}
                  />

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      or choose from available areas
                    </p>
                    <Button
                      onClick={() => {
                        setShowChecker(false);
                        setShowAreaList(true);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      View All Delivery Areas
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Area List Modal */}
      <ServiceAreaModal
        isOpen={showAreaList}
        onClose={() => {
          setShowAreaList(false);
          if (!selectedArea) setShowChecker(true);
        }}
      />

      {/* Main Content */}
      <div className={showChecker || showAreaList ? "pointer-events-none select-none" : ""}>
        <Home openAreaChecker={openChecker} />
      </div>

      {/* Floating Change Location Button */}
      {selectedArea && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            onClick={openChecker}
            size="lg"
            className="shadow-2xl rounded-full px-6 h-14 text-lg font-medium bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-200"
          >
            <MapPin className="mr-2 h-6 w-6 text-green-600" />
            {selectedArea.name}, {selectedArea.city}
            <span className="ml-2 text-green-600">Change</span>
          </Button>
        </motion.div>
      )}
    </>
  );
}
