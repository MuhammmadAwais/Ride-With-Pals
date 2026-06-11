import { useState } from 'react';

interface ProductType {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

const products: ProductType[] = [
  { id: 1, name: "Water Bottle", category: "Equipment", price: "20", image: "/Images/BottleImage.png" },
  { id: 2, name: "Bicycle Helmet", category: "Safety", price: "20", image: "/Images/headImage.png" },
  { id: 3, name: "Pro Gloves", category: "Apparel", price: "20", image: "/Images/cyclingGloveImage.png" },
  { id: 4, name: "Touring Elite", category: "Bicycles", price: "1,200", image: "/Images/cycleImage4.png" },
  { id: 5, name: "Speed Master", category: "Bicycles", price: "950", image: "/Images/cycleImage5.png" },
  { id: 6, name: "Helmet Selection", category: "Safety", price: "85", image: "/Images/headsImage.png" },
];

const Product = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleSelectProduct = (p: ProductType) => {
    setSelectedProduct(p);
    setActiveImage(p.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedProduct) {
    const thumbnails = [selectedProduct.image, "/Images/BottleImage2.png", "/Images/BottleImage3.png"];

    return (
      <div className="bg-[#050a0f] min-h-screen px-4 py-8 lg:px-20 text-white font-sans rounded-3xl">
        <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2">
          ← Back to Accessories
        </button>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 mb-20">
          {/* Left Column */}
          <div className="flex-1 w-full">
            <div className="bg-[#0a1118] p-4 rounded-3xl border border-white/10 mb-4">
              <img src={activeImage || selectedProduct.image} alt={selectedProduct.name} className="w-full h-auto rounded-2xl" />
            </div>
            <div className="flex gap-4">
              {thumbnails.map((imgSrc, index) => (
                <div key={index} onClick={() => setActiveImage(imgSrc)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 bg-[#0a1118] rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-[#EB712B]/50 transition-colors ${activeImage === imgSrc ? 'border-[#EB712B]' : ''}`}>
                  <img src={imgSrc} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">{selectedProduct.name}</h1>
                <p className="text-gray-400 mt-1">ProGear Elite Series • BPA Free • 750ml</p>
                <div className="flex items-center gap-2 mt-2 text-[#EB712B]">★★★★☆ <span className="text-sm text-gray-500">(124 reviews)</span></div>
              </div>
              <p className="text-2xl font-bold text-[#EB712B]">$24.99</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="flex items-center bg-[#0a1118] rounded-xl border border-white/10 px-4 h-14">
                  <button className="px-3 text-xl hover:text-[#EB712B]" onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                  <span className="px-6 font-bold w-12 text-center">{quantity}</span>
                  <button className="px-3 text-xl hover:text-[#EB712B]" onClick={() => setQuantity(prev => prev + 1)}>+</button>
                </div>
                <button className="flex-1 bg-[#EB712B] rounded-xl font-bold hover:bg-[#c95f1f]">Add to Cart ({quantity})</button>
              </div>
              <button 
  onClick={() => setIsWishlisted(!isWishlisted)} 
  className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 font-bold transition-all"
>
  <svg 
    className={`w-5 h-5 transition-colors duration-300 ${isWishlisted ? 'text-[#EB712B] fill-[#EB712B]' : 'text-white'}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
  {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
</button>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-6">
              <h2 className="font-bold text-xl">Description</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Elevate your hydration game with the Gym Mode Shaker. Engineered for high-performance athletes.</p>
              <div className="grid grid-cols-3 gap-4">
                {['Free Shipping', 'Lifetime Warranty', 'Easy Returns'].map((b) => (
                  <div key={b} className="bg-[#0a1118] p-3 rounded-xl border border-white/5 text-center text-[10px] font-bold text-gray-400">📦 {b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kit Section */}
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-16">
          <div className="flex justify-between items-end mb-10">
            <div><h2 className="text-3xl font-bold">Complete the Kit</h2><p className="text-gray-400 mt-2">Essential gear.</p></div>
            <a href="#" className="text-[#EB712B] hover:underline">View All →</a>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">            {products.filter(p => p.name !== "Touring Elite").slice(0, 4).map((p, index) => {
              const customData: any = { 0: { name: "Pro Yoga Mat", image: "/Images/mateImage.png" }, 1: { name: "Powergrip Gloves", image: "/Images/cyclingGloveImage2.png" }, 2: { name: "Elite Runner 3.0", image: "/Images/shoesImage.png" }, 3: { name: "QuickDry Sports Towel", image: "/Images/sportsTowelImage.png" } };
              const displayData = customData[index] || { name: p.name, image: p.image };
              return (
                <div key={p.id} className="bg-[#0a1118] p-4 rounded-3xl border border-white/5 hover:border-[#EB712B]/50 cursor-pointer" onClick={() => handleSelectProduct(p)}>
                  <div className="h-48 mb-4 overflow-hidden rounded-2xl bg-black"><img src={displayData.image} className="w-full h-full object-cover" /></div>
                  <h3 className="font-bold">{displayData.name}</h3>
                  <p className="text-[#EB712B] font-bold">$ {p.price}</p>
                </div>
              );
             })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen px-6 py-16 lg:px-20 text-white">
      <div className="max-w-7xl mx-auto mb-16">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">High Performance <span className="text-[#EB712B]">Gear</span></h1>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-[#EB712B]/50 transition-all hover:-translate-y-2">
            <div className="h-72 mb-6 overflow-hidden rounded-2xl"><img src={p.image} className="w-full h-full object-cover" /></div>
            <h3 className="text-xl font-bold mb-3">{p.name}</h3>
            <div className="flex justify-between items-center">
              <p className="font-bold text-2xl">$ {p.price}</p>
              <button onClick={() => handleSelectProduct(p)} className="bg-white/5 p-2 rounded-full hover:bg-[#EB712B]"> ➔ </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;