//하단 네비바
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

// Provided SVG icons (inactive gray fill, active gradient applied via parent class)
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon home">
    <path d="M6.5459 0.802734C8.00641 -0.268195 9.99359 -0.268195 11.4541 0.802734L16.4561 4.49805C17.4199 5.19571 17.9934 6.31113 18 7.50098V14.1895C17.94 16.267 16.2665 17.9205 14.2119 17.9785H3.79785C1.73934 17.9255 0.0600144 16.2709 0 14.1895V7.50098C0.00661318 6.31113 0.580091 5.19571 1.54395 4.49805L6.5459 0.802734ZM4.7373 12.5508C4.34499 12.5508 4.02653 12.8685 4.02637 13.2607C4.02637 13.6532 4.34489 13.9717 4.7373 13.9717H13.2627C13.6551 13.9717 13.9736 13.6532 13.9736 13.2607C13.9735 12.8685 13.655 12.5508 13.2627 12.5508H4.7373Z" fill="currentColor" />
  </svg>
);
const ScheduleIcon = () => (
  <svg width="17" height="21" viewBox="0 0 17 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon schedule">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.5802 0.000200281H7.29016C5.33505 0.00923052 3.67296 1.43025 3.36016 3.3602L3.29016 4.6802V12.8602C3.29016 15.0693 5.08102 16.8602 7.29016 16.8602H12.0902L13.4902 16.7902C15.3177 16.383 16.6182 14.7625 16.6202 12.8902V4.0002C16.6202 2.93237 16.1933 1.90884 15.4345 1.15754C14.6757 0.406231 13.6479 -0.010478 12.5802 0.000200281ZM11.8602 4.8802H6.47016C6.05595 4.8802 5.72016 5.21599 5.72016 5.6302C5.72016 6.04441 6.05595 6.3802 6.47016 6.3802H11.8602C12.2744 6.3802 12.6102 6.04441 12.6102 5.6302C12.6102 5.21599 12.2744 4.8802 11.8602 4.8802ZM6.47016 11.3202C6.05595 11.3202 5.72016 11.656 5.72016 12.0702C5.72016 12.4844 6.05595 12.8202 6.47016 12.8202H10.2902C10.7044 12.8202 11.0402 12.4844 11.0402 12.0702C11.0402 11.656 10.7044 11.3202 10.2902 11.3202H6.47016ZM13.4002 9.6002H6.47016C6.05595 9.6002 5.72016 9.26441 5.72016 8.8502C5.72016 8.43599 6.05595 8.1002 6.47016 8.1002H13.4002C13.8144 8.1002 14.1502 8.43599 14.1502 8.8502C14.1502 9.26441 13.8144 9.6002 13.4002 9.6002Z" fill="currentColor" />
    <path d="M1.08147e-05 7.41319V15.5832C-0.0026517 16.8173 0.486403 18.0016 1.35902 18.8742C2.23165 19.7468 3.41594 20.2358 4.65001 20.2332H9.65001C11.3601 20.2339 12.8482 19.1249 13.362 17.5351L11.8853 17.5671C11.1613 17.5671 10.6077 17.5681 9.65001 17.5671H7.29001C3.79001 17.5671 2.59165 14.8775 2.59165 13.0932V7.41319C2.59674 6.47342 2.59165 5.99825 2.59165 5.1858V3.7778C1.07407 4.31095 0.0107339 5.74951 1.08147e-05 7.41319Z" fill="#A0A0A0" />
  </svg>
);
const ExploreIcon = () => (
  <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon explore">
    <path d="M16.26 11.83V3.75C16.26 1.67893 14.5811 0 12.51 0H3.75C1.67893 0 0 1.67893 0 3.75V14.29C0 16.0628 1.43717 17.5 3.21 17.5H15.51C15.9242 17.5 16.26 17.1642 16.26 16.75C16.26 16.3358 15.9242 16 15.51 16H3.21C2.26559 16 1.5 15.2344 1.5 14.29C1.5 13.3456 2.26559 12.58 3.21 12.58H15.51C15.9242 12.58 16.26 12.2442 16.26 11.83Z" fill="#A0A0A0" />
    <path d="M3.21 13.54C2.79578 13.54 2.46 13.8758 2.46 14.29C2.46 14.7042 2.79578 15.04 3.21 15.04H14.28C14.6942 15.04 15.03 14.7042 15.03 14.29C15.03 13.8758 14.6942 13.54 14.28 13.54H3.21Z" fill="#A0A0A0" />
  </svg>
);
const CommunityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon community">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.5617 0H4.44174C1.92064 0.086985 -0.060079 2.18816 0.00174431 4.71V18.44C-0.0240709 18.9013 0.23859 19.3304 0.661181 19.5172C1.08377 19.7041 1.5779 19.6096 1.90174 19.28L4.27174 16.75C4.72329 16.2764 5.34739 16.0058 6.00175 16H15.5217C16.7508 15.9688 17.9163 15.4468 18.758 14.5507C19.5997 13.6545 20.0476 12.4586 20.0017 11.23V4.71C20.0636 2.18816 18.0828 0.086985 15.5617 0ZM6.25174 5.22H11.2517C11.666 5.22 12.0017 5.55579 12.0017 5.97C12.0017 6.38421 11.666 6.72 11.2517 6.72H6.25174C5.83753 6.72 5.50174 6.38421 5.50174 5.97C5.50174 5.55579 5.83753 5.22 6.25174 5.22ZM6.25174 10.72H13.7517C14.166 10.72 14.5017 10.3842 14.5017 9.97C14.5017 9.55579 14.166 9.22 13.7517 9.22H6.25174C5.83753 9.22 5.50174 9.55579 5.50174 9.97C5.50174 10.3842 5.83753 10.72 6.25174 10.72Z" fill="#9B9B9B" />
  </svg>
);
const ProfileIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon profile">
    <path d="M12.6401 20H3.36009C2.34927 19.9633 1.40766 19.477 0.792441 18.6742C0.17722 17.8713 -0.0473393 16.8356 0.180094 15.85L0.420094 14.71C0.69613 13.1668 2.02272 12.0327 3.59009 12H12.4101C13.9775 12.0327 15.3041 13.1668 15.5801 14.71L15.8201 15.85C16.0475 16.8356 15.823 17.8713 15.2077 18.6742C14.5925 19.477 13.6509 19.9633 12.6401 20Z" fill="#A0A0A0" />
    <path d="M8.50009 10H7.50009C5.29096 10 3.50009 8.20915 3.50009 6.00001V3.36001C3.49743 2.46807 3.85057 1.61189 4.48127 0.981192C5.11197 0.350491 5.96815 -0.00265152 6.86009 1.49917e-05H9.14009C10.032 -0.00265152 10.8882 0.350491 11.5189 0.981192C12.1496 1.61189 12.5028 2.46807 12.5001 3.36001V6.00001C12.5001 7.06088 12.0787 8.0783 11.3285 8.82844C10.5784 9.57859 9.56096 10 8.50009 10Z" fill="#A0A0A0" />
  </svg>
);

const items = [
  { key: 'home', label: '홈', path: '/', Icon: HomeIcon },
  { key: 'newsletter', label: '뉴스레터', path: '/newsletter', Icon: ScheduleIcon },
  { key: 'explore', label: '탐험지', path: '/explore', Icon: ExploreIcon },
  { key: 'community', label: '커뮤니티', path: '/community', Icon: CommunityIcon },
  { key: 'profile', label: '프로필', path: '/profile', Icon: ProfileIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (key) => {
    if (key === 'explore') return location.pathname.startsWith('/explore');
    if (key === 'community') return location.pathname.startsWith('/community');
    if (key === 'newsletter') return location.pathname.startsWith('/newsletter');
    if (key === 'profile') return location.pathname.startsWith('/profile');
    return location.pathname === '/';
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(({ key, label, path, Icon }) => {
          const active = isActive(key);
          return (
            <button
              key={key}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
              data-key={key}
              onClick={() => navigate(path)}
              aria-label={label}
            >
              <span className={`icon-wrapper ${active ? 'active' : ''}`}>
                <Icon />
              </span>
              <span className="bottom-nav-label">{label}</span>
            </button>
          );
        })}
      </div>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="nav-gradient" x1="-1.47414" y1="0" x2="22.2233" y2="6.11196" gradientUnits="userSpaceOnUse">
            <stop stopColor="#448FFF" />
            <stop offset="1" stopColor="#4833D0" />
          </linearGradient>
        </defs>
      </svg>
    </nav>
  );
}
