import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, setLanguage, supportedLanguages, currentLangMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`lang-selector-wrapper ${variant}`} ref={dropdownRef}>
      <button
        type="button"
        className="lang-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Select Language / ቋንቋ ይምረጡ"
      >
        <span className="lang-icon">🌐</span>
        <span className="lang-label">{currentLangMeta.nativeName}</span>
        <span className="lang-caret">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu shadow-lg">
          <div className="lang-menu-header">Select Language / ቋንቋ</div>
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-option-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <div className="lang-names">
                  <span className="lang-native">{lang.nativeName}</span>
                  <span className="lang-english">{lang.label}</span>
                </div>
                {isSelected && <span className="lang-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
