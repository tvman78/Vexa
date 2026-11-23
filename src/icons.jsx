import React from 'react';

// Custom navigation icons. Home is a house with an open garage and a car parked inside.
const PATHS = {
  home: <>
    <path className="ico-roof" d="M2.5 11.2 12 3.4l9.5 7.8" />
    <path d="M5 9.6V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.6" />
    <path className="ico-door" d="M7.6 11.8h8.8" />
    <path className="ico-accent" d="M7.7 18.2v-1.7l1.1-2.2c.15-.3.45-.5.8-.5h4.8c.35 0 .65.2.8.5l1.1 2.2v1.7z" />
    <circle className="ico-light" cx="9.5" cy="16.6" r=".55" /><circle className="ico-light" cx="14.5" cy="16.6" r=".55" />
  </>,
  brands: <>
    <path d="M12 2.8 19.5 5.6v6c0 4.6-3.1 7.9-7.5 9.6-4.4-1.7-7.5-5-7.5-9.6v-6z" />
    <path className="ico-accent" d="m8.4 8.6 3.6 7.2 3.6-7.2" />
  </>,
  cars: <>
    <path d="M3 16.5v-3.2l2-1.1 2.2-4a2 2 0 0 1 1.75-1h6.1a2 2 0 0 1 1.75 1l2.2 4 2 1.1v3.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path className="ico-accent" d="M6.6 12.2h10.8" />
    <circle cx="7.4" cy="17.6" r="1.9" /><circle cx="16.6" cy="17.6" r="1.9" />
  </>,
  motorcycles: <>
    <circle cx="5.6" cy="16.6" r="3.4" /><circle cx="18.4" cy="16.6" r="3.4" />
    <path d="M5.6 16.6 9.4 10.6h5.2l3.8 6" />
    <path className="ico-accent" d="M9.4 10.6 11.6 15h3l-.4-4.4M13.4 6.8h2.5l1.3 3.8" />
  </>,
  compare: <>
    <path d="M4 8h13.5M14 4.5 17.5 8 14 11.5" />
    <path className="ico-accent" d="M20 16H6.5M10 12.5 6.5 16l3.5 3.5" />
  </>,
  favorites: <path className="ico-accent" d="M12 20.4S3.4 15.4 3.4 9.1A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.6 2.2c0 6.3-8.6 11.3-8.6 11.3z" />,
  help: <>
    <path d="M4 5.6a1.6 1.6 0 0 1 1.6-1.6h12.8A1.6 1.6 0 0 1 20 5.6v9.8a1.6 1.6 0 0 1-1.6 1.6H11l-4.2 3.4V17H5.6A1.6 1.6 0 0 1 4 15.4z" />
    <path className="ico-accent" d="M9.8 8.7a2.3 2.3 0 1 1 3.5 2c-.8.5-1.3.9-1.3 1.8" />
    <circle className="ico-light" cx="12" cy="14.6" r=".6" />
  </>,
  settings: <>
    <circle className="ico-accent" cx="12" cy="12" r="3.1" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.85 1.85M16.65 16.65l1.85 1.85M18.5 5.5l-1.85 1.85M7.35 16.65 5.5 18.5" />
    <circle cx="12" cy="12" r="6.6" />
  </>,
};

export const NavIcon = ({ name }) => (
  <svg className={`nav-ico ico-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {PATHS[name]}
  </svg>
);
