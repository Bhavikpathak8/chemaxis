import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = totalScroll / windowHeight;
      setProgress(scrollPercent * 100);
      setShowTopBtn(totalScroll > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll indicator bar at top */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#0b7a55] via-[#10b981] to-[#34d399] transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Scroll to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#0b7a55] text-white shadow-lg transition-all hover:bg-[#08603f] hover:scale-110 active:scale-95"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </>
  );
}
