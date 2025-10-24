import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChefHat, Clock, MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/MenuItemCard";
import { mockMenuItems } from "@/lib/mockData";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Home = () => {
  const featuredItems = mockMenuItems.filter((item) => item.featured);
  const categories = [
    { name: "Breakfast", icon: "🍳", link: "/menu?category=breakfast" },
    { name: "Lunch", icon: "🍛", link: "/menu?category=lunch" },
    { name: "Dinner", icon: "🍲", link: "/menu?category=dinner" },
    { name: "Desserts", icon: "🍰", link: "/menu?category=desserts" },
    { name: "Beverages", icon: "🥤", link: "/menu?category=beverages" },
  ];

  const testimonials = [
    {
      name: "Ahmed Khan",
      rating: 5,
      comment: "Best Pakistani food in town! The biryani is absolutely amazing.",
    },
    {
      name: "Fatima Ali",
      rating: 5,
      comment: "Fast delivery and delicious food. Highly recommended!",
    },
    {
      name: "Hassan Raza",
      rating: 5,
      comment: "Authentic taste that reminds me of home-cooked meals.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Bringing Pakistani
                <span className="text-primary block">Taste to Your Table</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Experience authentic Pakistani cuisine delivered fresh to your doorstep. 
                Order now and taste the tradition!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="shadow-warm">
                  <Link to="/menu">
                    Order Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/menu">Browse Menu</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">30-45 mins</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                    <ChefHat className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Expert Chefs</p>
                  <p className="text-xs text-muted-foreground">Authentic recipes</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Wide Coverage</p>
                  <p className="text-xs text-muted-foreground">7+ areas</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"
                alt="Delicious Pakistani Food"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-warm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Star className="h-6 w-6 text-accent-foreground fill-current" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-xs text-muted-foreground">1000+ Reviews</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Menu</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From breakfast to dinner, find your favorite Pakistani dishes
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={category.link}
                className="group block bg-card rounded-xl p-6 text-center hover:shadow-warm transition-all border"
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Dishes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Try our most popular and loved dishes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item, index) => (
            <MenuItemCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" variant="outline" asChild>
            <Link to="/menu">View Full Menu</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real reviews from real food lovers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{testimonial.comment}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="gradient-primary rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Discover your digital health score and order your favorite Pakistani dishes today!
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/menu">Start Ordering Now</Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
