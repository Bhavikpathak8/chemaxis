const TICKER_ITEMS = [
  { name: 'Phenol 99.5%', price: '₹107.00 / kg', change: '+2.4%', up: true, location: 'Dahej Hub' },
  { name: 'Methanol Pure', price: '₹29.80 / kg', change: '+1.1%', up: true, location: 'Kandla Port' },
  { name: 'Caustic Soda Lye 48%', price: '₹37.50 / kg', change: '-0.5%', up: false, location: 'Ankleshwar' },
  { name: 'Acetone CP Grade', price: '₹76.00 / kg', change: '+3.2%', up: true, location: 'Surat Corridor' },
  { name: 'Ethyl Acetate 99%', price: '₹68.50 / kg', change: '+0.8%', up: true, location: 'Bharuch' },
  { name: 'Toluene Industrial', price: '₹84.20 / kg', change: '-1.2%', up: false, location: 'Hazira PCPIR' },
  { name: 'Acetic Acid Glacial', price: '₹41.50 / kg', change: '+1.9%', up: true, location: 'Vapi Belt' },
  { name: 'Isopropyl Alcohol (IPA)', price: '₹98.00 / kg', change: '+0.4%', up: true, location: 'Panoli GIDC' },
];

export default function LiveTicker() {
  return (
    <div className="relative w-full overflow-hidden border-y border-[#d0ded7] bg-white/90 py-2.5 backdrop-blur-md shadow-xs">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />

      <div className="flex w-max items-center gap-6 anim-marquee">
        {/* Render twice for seamless continuous scroll */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 rounded-full border border-[#dbe1de] bg-[#f8faf9] px-3.5 py-1 text-[13px] transition-all hover:border-[#0b7a55] hover:bg-[#e4f2ec]/60"
          >
            <span className="flex items-center gap-1.5 font-medium text-[#1b2433]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#0b7a55] animate-pulse" />
              {item.name}
            </span>
            <span className="font-mono font-semibold text-[#0b7a55]">{item.price}</span>
            <span
              className={`flex items-center text-[11.5px] font-mono font-medium ${
                item.up ? 'text-[#0b7a55]' : 'text-rose-600'
              }`}
            >
              {item.change}
            </span>
            <span className="rounded bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-[#4a5666] border border-[#e2e8e5]">
              {item.location}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
