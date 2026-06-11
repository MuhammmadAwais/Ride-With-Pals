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
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  if (selectedProduct) {
    return (
      <div className="bg-[#050a0f] min-h-screen px-6 py-12 lg:px-20 text-white font-sans">
        <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2">
          ← Back to Accessories
        </button>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 mb-20">
          <div className="flex-1">
            <div className="bg-[#0a1118] p-4 rounded-3xl border border-white/10 mb-4">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-auto rounded-2xl" />
            </div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-24 bg-[#0a1118] rounded-xl border border-white/10" />
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-bold">{selectedProduct.name}</h1>
              <p className="text-2xl font-bold">$24.99</p>
            </div>
            <p className="text-gray-400">ProGear Elite Series • BPA Free • 750ml</p>
            
            <div>
              <p className="text-sm text-gray-400 mb-2">FINISH:</p>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#EB712B] bg-black" />
                <div className="w-8 h-8 rounded-full bg-white" />
                <div className="w-8 h-8 rounded-full bg-gray-700" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center bg-[#0a1118] rounded-xl border border-white/10 px-4">
                <button className="px-3">-</button>
                <span className="px-4">1</span>
                <button className="px-3">+</button>
              </div>
              <button className="flex-1 bg-[#EB712B] py-4 rounded-xl font-bold hover:bg-[#c95f1f]">Add to Cart</button>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <h2 className="font-bold text-xl">Description</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Elevate your hydration game with the Gym Mode Shaker.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ BPA and Phthalate-free medical grade plastic</li>
                <li>✓ Dishwasher safe for effortless cleaning</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-12">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Complete the Kit</h2>
            <a href="#" className="text-[#EB712B] hover:underline">View All Accessories →</a>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter((p) => p.name !== "Touring Elite").slice(0, 4).map((p, index) => {
              const customData: Record<number, { name: string; image: string }> = {
                0: { name: "Pro Yoga Mat", image: "/Images/mateImage.png" },
                1: { name: "Powergrip Gloves", image: "/Images/cyclingGloveImage2.png" },
                2: { name: "Elite Runner 3.0", image: "/Images/shoesImage.png" },
                3: { name: "QuickDry Sports Towel", image: "/Images/sportsTowelImage.png" },
              };
              const displayData = customData[index] || { name: p.name, image: p.image };
              return (
                <div key={p.id} className="bg-[#0a1118] p-4 rounded-2xl border border-white/5 hover:border-[#EB712B]/30 transition-all cursor-pointer" onClick={() => setSelectedProduct(p)}>
                  <div className="h-40 mb-4 overflow-hidden rounded-xl bg-black">
                    <img src={displayData.image} alt={displayData.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-white">{displayData.name}</h3>
                  <p className="text-[#EB712B] font-bold">${p.price}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen px-6 py-16 lg:px-20 font-sans text-white">
      <div className="max-w-6xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
          High Performance <span className="text-[#EB712B]">Gear</span>
        </h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className="group relative bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 hover:border-[#EB712B]/50 transition-all duration-500 hover:-translate-y-2">
            <div className="relative rounded-2xl mb-6 overflow-hidden h-72">
              <div className="absolute inset-0  from-black/60 to-transparent z-10" />
              <img src={p.image} alt={p.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
            </div>
            <div className="px-1">
              <p className="text-[10px] font-bold text-[#EB712B] uppercase tracking-[0.2em] mb-2">{p.category}</p>
              <h3 className="text-xl font-bold mb-3">{p.name}</h3>
              <div className="flex items-center justify-between">
                <p className="font-bold text-2xl">$ {p.price}</p>
                <button onClick={() => setSelectedProduct(p)} className="bg-white/5 p-2 rounded-full hover:bg-[#EB712B] transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;