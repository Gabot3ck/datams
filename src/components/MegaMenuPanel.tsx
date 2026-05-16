import { useState, useEffect } from 'react';
import type { RefObject } from 'react';
import type { MegaSubcategory } from './MegaMenu';

interface Props {
  panelRef: RefObject<HTMLDivElement | null>;
  panelTop: number;
  subcategories: MegaSubcategory[];
  activeTab: number;
  onTabChange: (i: number) => void;
  isClosing: boolean;
}

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

export default function MegaMenuPanel({
  panelRef,
  panelTop,
  subcategories,
  activeTab,
  onTabChange,
  isClosing,
}: Props) {
  const activeSub = subcategories[activeTab];

  const [hoveredItemImage, setHoveredItemImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setHoveredItemImage(undefined);
  }, [activeTab]);

  const displayedImage = hoveredItemImage ?? activeSub.image;

  return (
    <>
      {/* Backdrop debajo del panel */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 ${isClosing ? 'animate-mega-close' : 'animate-fade-in'}`}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{ top: panelTop }}
        className={`fixed left-0 right-0 z-50 bg-white shadow-xl border-t border-gray-100 ${isClosing ? 'animate-mega-close' : 'animate-mega-open'}`}
      >
        <div className="container-custom py-6">
          {/* Tab bar — navegación por hover */}
          <div className="flex gap-4 border-b border-gray-100 pb-0 mb-6 overflow-x-auto no-scrollbar">
            {subcategories.map((sub, i) => (
              <button
                key={i}
                onMouseEnter={() => onTabChange(i)}
                className={`flex flex-col items-center gap-3 px-6 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-3 -mb-px hover:cursor-pointer ${
                  activeTab === i
                    ? 'text-brand-light border-brand-light'
                    : 'text-neutral-grey border-transparent hover:text-brand-light'
                }`}
              >
                <Icon />
                {sub.label}
              </button>
            ))}
          </div>

          {/* Items + imagen de la subcategoría */}
          <div className="flex gap-10 min-h-[400px]">
            {/* Lista de items — fade al cambiar tab, hover con fondo gris */}
            <div key={activeTab} className="flex-1 grid grid-cols-2 gap-x-4 gap-y-0.5 content-start py-1 animate-fade-in">
              {activeSub.items.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="group flex items-start px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onMouseEnter={() => setHoveredItemImage(item.image)}
                  onMouseLeave={() => setHoveredItemImage(undefined)}
                >
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-neutral-dark group-hover:text-brand-light transition-colors leading-snug">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="block text-xs text-neutral-grey mt-1 leading-relaxed">
                        {item.description}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {/* Imagen: del item hovereado si tiene, o de la subcategoría como fallback */}
            <div className="w-72 xl:w-80 shrink-0 self-stretch">
              {displayedImage ? (
                <img
                  key={displayedImage}
                  src={displayedImage}
                  alt=""
                  width={320}
                  height={400}
                  className="rounded-xl object-cover w-full h-full shadow-sm animate-fade-in"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gray-50" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
