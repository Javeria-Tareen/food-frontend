// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuItemCard } from "@/features/menu/components/MenuItemCard";
import { useFullMenuCatalog } from "@/features/menu/hooks/useMenuApi";
import { Footer } from "@/components/Footer";

interface HomeProps {
  openAreaChecker: () => void;
}

export const Home: React.FC<HomeProps> = ({ openAreaChecker }) => {
  const { data, isLoading, isError } = useFullMenuCatalog();

  const allItems = data?.menu || [];
  const featuredItems = allItems.slice(0, 9); // Show first 9 as popular

  const promotionalTexts = [
    { main: "CASHBACK", sub: "up to 30% cashback on all orders" },
    { main: "FREE DELIVERY", sub: "Free delivery on orders above Rs. 500" },
    { main: "SPECIAL DISCOUNT", sub: "Get 20% off on your first order" },
  ];

  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promotionalTexts.length);
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { name: "Breakfast", icon: "Coffee", link: "/menu?category=breakfast" },
    { name: "Lunch", icon: "Bowl", link: "/menu?category=lunch" },
    { name: "Dinner", icon: "Drumstick", link: "/menu?category=dinner" },
    { name: "Desserts", icon: "Cake", link: "/menu?category=desserts" },
    { name: "Beverages", icon: "Glass", link: "/menu?category=beverages" },
  ];

  const testimonials = [
    { name: "Ahmed Khan", rating: 5, comment: "Best Pakistani food in town! The biryani is absolutely amazing." },
    { name: "Fatima Ali", rating: 5, comment: "Fast delivery and delicious food. Highly recommended!" },
    { name: "Hassan Raza", rating: 5, comment: "Authentic taste that reminds me of home-cooked meals." },
  ];

  return (
    <div className="min-h-screen bg-background">
   

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="text-foreground">SUPER</span>
              <motion.span
                key={currentPromoIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary block text-7xl md:text-9xl font-extrabold"
              >
                {promotionalTexts[currentPromoIndex].main}
              </motion.span>
            </h1>

            <motion.p
              key={currentPromoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-muted-foreground mb-12"
            >
              {promotionalTexts[currentPromoIndex].sub}
            </motion.p>

            <div className="flex flex-col gap-6 items-center mb-16">
              <div className="w-full max-w-2xl">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <input
                      type="text"
                      placeholder="Enter your town or area"
                      className="w-full pl-12 pr-6 py-5 rounded-xl border bg-card text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button size="lg" className="px-12 text-lg font-semibold">
                    Search
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10"
                onClick={openAreaChecker}
              >
                Change Delivery Area
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Browse by Category</h2>
          <p className="text-lg text-muted-foreground">Discover your favorite Pakistani dishes</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={cat.link}
                className="group block p-10 bg-card rounded-3xl text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 border"
              >
                <div className="text-7xl mb-6">{cat.icon}</div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Dishes (First 9 items) */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Popular Dishes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Most ordered and loved by our customers
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
            <p className="text-xl text-destructive mb-8">Failed to load menu</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">No items available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="transform transition-all hover:scale-105"
              >
                <MenuItemCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/menu">View Full Menu →</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">Real reviews from happy foodies</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-card p-8 rounded-3xl shadow-xl border"
              >
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="italic text-lg mb-6 leading-relaxed">"{t.comment}"</p>
                <p className="font-bold text-right">- {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-20 text-white shadow-2xl"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Hungry?</h2>
          <p className="text-2xl mb-10 opacity-90">
            Order your favorite Pakistani meal now — hot & fresh in 30 mins
          </p>
          <Button size="lg" variant="secondary" className="text-2xl px-16 py-8 font-bold" asChild>
            <Link to="/menu">Order Now</Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;