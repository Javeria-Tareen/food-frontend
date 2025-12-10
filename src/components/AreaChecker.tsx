// src/components/AreaChecker.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Navigation, X, Search } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAreaStore } from "@/lib/areaStore";
import { useNavigate } from "react-router-dom";

interface CheckAreaResponse {
  success: boolean;
  inService: boolean;
  hasDeliveryZone: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
    center: { lat: number; lng: number };
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
  message?: string;
}

interface AreaCheckerProps {
  onConfirmed?: (data: any) => void;
  onNotInService?: () => void;
  onClose?: () => void;
  disableAutoNavigate?: boolean;
}

export default function AreaChecker({
  onConfirmed,
  onNotInService,
  onClose,
  disableAutoNavigate = false,
}: AreaCheckerProps) {
  const [detecting, setDetecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const navigate = useNavigate();
  const { setSelectedArea } = useAreaStore();

  // Load Google Places Autocomplete
  useEffect(() => {
    if (!window.google?.maps?.places && import.meta.env.VITE_GOOGLE_PLACES_API_KEY) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_PLACES_API_KEY
      }&libraries=places`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => initializeAutocomplete();
      script.onerror = () => toast.error("Failed to load maps");

      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    } else if (window.google?.maps?.places) {
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "pk" },
      fields: ["formatted_address", "geometry.location", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) {
        toast.error("Please select a valid location from the dropdown");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || "Selected Location";

      checkArea(lat, lng, address);
    });

    autocompleteRef.current = autocomplete;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    toast.loading("Detecting your location...", { duration: 0 });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss();
        const { latitude, longitude } = position.coords;
        checkArea(latitude, longitude, "Your Current Location");
      },
      (error) => {
        toast.dismiss();
        const messages: Record<number, string> = {
          1: "Location access denied. Please allow location permissions.",
          2: "Location unavailable. Try entering your address manually.",
          3: "Location request timed out. Try again.",
        };
        toast.error(messages[error.code] || "Could not detect location");
        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const checkArea = async (lat: number, lng: number, address: string) => {
    if (checking || detecting) return;

    setChecking(true);
    try {
      const res = await apiClient.get<CheckAreaResponse>("/areas/check", {
        params: { lat, lng },
        timeout: 10000,
      });

      const data = res;

      if (data.inService && data.area) {
        const payload = {
          id: data.area._id,
          name: data.area.name,
          city: data.area.city,
          fullAddress: address,
          centerLatLng: data.area.center,
          deliveryFee: data.delivery?.fee ?? 199,
          estimatedTime: data.delivery?.estimatedTime ?? "35-50 min",
          minOrderAmount: data.delivery?.minOrder ?? 0,
        };

        setSelectedArea(payload);
        sessionStorage.setItem("selectedArea", JSON.stringify(payload));
        sessionStorage.setItem("areaCheckedAt", Date.now().toString());

        toast.success(
          data.hasDeliveryZone
            ? `Delivering to ${data.area.name}! Fee: Rs.${payload.deliveryFee}`
            : `We’re in ${data.area.name}! Delivery coming soon`,
          { duration: 5000 }
        );

        onConfirmed?.(payload);

        if (!disableAutoNavigate) {
          navigate(`/menu/area/${data.area._id}`, { replace: true });
        }
      } else {
        toast.info(data.message || "Sorry, we don’t deliver to this location yet");
        onNotInService?.();
      }
    } catch (err: any) {
      console.error("Area check failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to check location. Please try again.";
      toast.error(msg);
      onNotInService?.();
    } finally {
      setChecking(false);
      setDetecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 rounded-3xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <MapPin className="h-8 w-8" />
            Delivery Location
          </h3>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-green-50">Enter your address to see if we deliver there</p>
      </div>

      <div className="p-6 space-y-6 bg-white">
        {/* Detect Location Button */}
        <Button
          onClick={detectLocation}
          disabled={detecting || checking}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {(detecting || checking) ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Detecting Location...
            </>
          ) : (
            <>
              <Navigation className="mr-3 h-6 w-6" />
              Use My Current Location
            </>
          )}
        </Button>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type="text"
            placeholder="Search your address in Pakistan..."
            className="pl-12 pr-4 py-7 text-lg rounded-xl border-2 focus:border-primary focus-visible:ring-0 transition-all"
            onFocus={() => inputRef.current?.select()}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Currently delivering to select areas in <strong>Lahore</strong>
          </p>
          <p className="text-xs text-muted-foreground/80">
            More cities coming soon!
          </p>
        </div>
      </div>
    </Card>
  );
}