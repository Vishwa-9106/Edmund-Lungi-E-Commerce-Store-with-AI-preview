import { Users, Award, Heart, Leaf } from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: "Crafted with Love",
      description: "Every lungi is handcrafted by skilled artisans who pour their heart into each piece."
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We source only the finest fabrics to ensure comfort and durability."
    },
    {
      icon: Leaf,
      title: "Sustainable",
      description: "Eco-friendly practices and natural materials for a greener tomorrow."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Supporting local weavers and preserving traditional craftsmanship."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Edmund Lungi's</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where tradition meets modern comfort. We're passionate about bringing you the finest 
            handcrafted lungis that celebrate heritage while embracing contemporary style.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded with a vision to preserve the rich tradition of lungi making, Edmund Lungi's 
                  has been serving customers for over two decades. What started as a small family 
                  business has grown into a beloved brand known for quality and authenticity.
                </p>
                <p>
                  Our journey began in the textile heartland of South India, where we learned the 
                  art of weaving from master craftsmen. Today, we continue that legacy by working 
                  directly with skilled artisans to create lungis that are both traditional and trendy.
                </p>
                <p>
                  Every piece in our collection tells a story – of heritage, of craftsmanship, 
                  and of the hands that carefully wove it together.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <span className="font-display text-6xl font-bold gradient-text">20+</span>
                <p className="text-lg text-muted-foreground mt-2">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-background rounded-xl p-6 text-center card-hover">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Happy Customers" },
              { value: "500+", label: "Unique Designs" },
              { value: "100+", label: "Artisans" },
              { value: "15+", label: "States Served" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
