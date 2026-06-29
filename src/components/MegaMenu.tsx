import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import MegaMenuPanel from './MegaMenuPanel';

export interface MegaSubItem {
  label: string;
  href: string;
  description?: string;
  image?: string;
}

export interface MegaSubcategory {
  label: string;
  image?: string;
  items: MegaSubItem[];
}

export interface MegaMiniLink {
  label: string;
  href: string;
}

interface Props {
  label: string;
  subcategories: MegaSubcategory[];
  lang: 'es' | 'en';
  pillarUrl?: string;
  categoryLabel?: string;
  miniLinks?: MegaMiniLink[];
}

const CLOSE_MS = 150;

export default function MegaMenu({ label, subcategories, lang, pillarUrl, categoryLabel, miniLinks }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [panelTop, setPanelTop] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closePanel = useCallback(() => {
    if (!isOpenRef.current) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, CLOSE_MS);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        closePanel();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [closePanel]);

  const isActive = isOpen && !isClosing;

  const panel = (isOpen || isClosing) ? (
    <MegaMenuPanel
      panelRef={panelRef}
      panelTop={panelTop}
      subcategories={subcategories}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isClosing={isClosing}
      lang={lang}
      pillarUrl={pillarUrl}
      categoryLabel={categoryLabel}
      miniLinks={miniLinks}
    />
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => {
          if (isActive) {
            closePanel();
          } else if (!isOpen) {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            setIsClosing(false);
            const header = document.querySelector('header');
            if (header) setPanelTop(header.getBoundingClientRect().bottom);
            setIsOpen(true);
          }
        }}
        aria-expanded={isActive}
        aria-haspopup="true"
        className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brand-light hover:cursor-pointer ${
          isActive ? 'text-brand-light bg-gray-50' : 'text-neutral-grey'
        }`}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-3.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isMounted && createPortal(panel, document.body)}
    </div>
  );
}
