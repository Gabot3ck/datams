import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface MegaSubItem {
  label: string;
  href: string;
  image?: string;
}

export interface MegaSubcategory {
  label: string;
  items: MegaSubItem[];
}

interface Props {
  label: string;
  subcategories: MegaSubcategory[];
}

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

export default function MegaMenu({ label, subcategories }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<MegaSubItem | null>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const header = document.querySelector('header');
      if (header) setPanelTop(header.getBoundingClientRect().bottom);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setIsOpen(false);
        setHoveredItem(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setHoveredItem(null); }
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const activeSub = subcategories[activeTab];

  const panel = isOpen ? (
    <div
      ref={panelRef}
      style={{ top: panelTop }}
      className="fixed left-0 right-0 z-50 bg-white shadow-xl border-t border-gray-100 animate-[fadeIn_0.15s_ease]"
    >
      <div className="container-custom py-5">
        {/* Tab bar */}
        <div className="flex gap-2 border-b border-gray-100 pb-0 mb-5 overflow-x-auto no-scrollbar">
          {subcategories.map((sub, i) => (
            <button
              key={i}
              onClick={() => { setActiveTab(i); setHoveredItem(null); }}
              className={`flex flex-col items-center gap-1.5 px-5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
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

        {/* Items grid + image preview */}
        <div className="flex gap-8 min-h-[180px]">
          <div className="flex-1 grid grid-cols-3 gap-x-10 gap-y-3 content-start py-1">
            {activeSub.items.map((item, i) => (
              <a
                key={i}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.image ? item : null)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group flex items-start gap-2 py-1"
              >
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-light opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                <span className="text-sm font-semibold text-neutral-dark group-hover:text-brand-light transition-colors leading-snug">
                  {item.label}
                </span>
              </a>
            ))}
          </div>

          {/* Image panel */}
          <div className="w-56 shrink-0">
            {hoveredItem?.image ? (
              <img
                key={hoveredItem.image}
                src={hoveredItem.image}
                alt=""
                width={224}
                height={160}
                className="rounded-xl object-cover w-full h-40 shadow-sm"
              />
            ) : (
              <div className="w-full h-40 rounded-xl bg-gray-50" />
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-brand-light ${
          isOpen ? 'text-brand-light bg-gray-50' : 'text-neutral-grey'
        }`}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isMounted && createPortal(panel, document.body)}
    </div>
  );
}
