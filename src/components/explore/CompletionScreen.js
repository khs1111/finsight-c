import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import FloatingQuizCTA from './FloatingQuizCTA';

export default function CompletionScreen({
  score,
  total,
  results = [],
  questions = [],
  onRetry,
  onExplore,
}) {
  const navigate = useNavigate();
  // bottom nav height 측정 (FloatingQuizCTA와 동일한 기준 사용)
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    function measure() {
      const nav = document.querySelector('.bottom-nav');
      if (nav) {
        const h = nav.getBoundingClientRect().height;
        setNavHeight(h);
      } else {
        setNavHeight(0);
      }
    }
    measure();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    if (ro) {
      const nav = document.querySelector('.bottom-nav');
      if (nav) ro.observe(nav);
    }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

  // 스택 계산 (FloatingQuizCTA 기본값과 동기화)
  const baseBottom = navHeight + 16; // stackIndex=0 bottom
  const buttonHeight = 60;
  const gap = 16;
  const topCTABottom = baseBottom + (buttonHeight + gap) * 1; // stackIndex=1
  const premiumBubbleBottom = topCTABottom + buttonHeight + gap; // 위 CTA 위로 16px
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "917px",
        margin: "0 auto",
        background: "#F4F6FA",
        fontFamily: "Roboto, sans-serif",
        position: "relative",
      }}
    >
      {/* ===== Status Bar ===== */}
      <div
        style={{
          position: "absolute",
          top: "98px", // speech bubble top (138px) - 40px
          left: 0,
          width: "100%",
          height: "48px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 3,
        }}
      ></div>

      {/* ===== 말풍선 ===== */}
      <div
        style={{
          position: "absolute",
          top: "138px", // 상태바(48px) 아래 40px 간격 => 48 + 40 = 88
          left: "24px",
          right: "24px",
          width: "calc(100% - 48px)",
          height: "88px",
          filter: "drop-shadow(0px 0px 12px rgba(0,0,0,0.08))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 24px",
            gap: "10px",
            width: "165px",
            height: "74px",
            background: "#FFFFFF",
            borderRadius: "16px",
          }}
        >
          <span
            style={{
              width: "117px",
              height: "42px",
              fontFamily: "Roboto, sans-serif",
              fontWeight: 700,
              fontSize: "18px",
              lineHeight: "21px",
              textAlign: "center",
              letterSpacing: "-0.02em",
              color: "#474747",
              whiteSpace: "pre-line",
            }}
          >
            {score === 0 ? (
              "아쉽게도 모두 틀렸어요"
            ) : (
              <>
                참 잘했어요
                <br />
                {`${score}개 맞췄어요`}
              </>
            )}
          </span>
        </div>
        <div
          style={{
            width: "18px",
            height: "14px",
            background: "#FFFFFF",
            clipPath: "polygon(50% 100%, 0 0, 100% 0)",
            marginTop: "-2px",
          }}
        />
      </div>

      {/* ===== 캐릭터 SVG 자리 ===== */}
      <div
        style={{
          position: "absolute",
          top: "240px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "240px",
          height: "240px",
        }}
      >
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="118.852"
            cy="126.146"
            rx="75.7939"
            ry="65.175"
            fill="#272727"
          />
          <path
            d="M104.465 13.3857C121.493 17.7509 114.71 49.504 108.958 65.5757C108.779 66.0769 108.415 66.4776 107.94 66.7181L104.727 68.3439C103.031 69.2021 101.155 67.52 101.761 65.7193C113.478 30.874 105.62 28.6598 103.111 27.6204C95.5163 24.4748 89.5196 35.6476 85.3925 37.3523C81.2654 39.057 60.0614 46.2061 58.0225 37.3961C55.9836 28.5861 82.8351 7.84089 104.465 13.3857Z"
            fill="#272727"
          />
          <path
            d="M137.966 13.8137C120.547 16.185 123.61 48.5077 127.464 65.1355C127.584 65.6542 127.899 66.0942 128.343 66.388L131.347 68.374C132.932 69.4221 134.989 67.9676 134.596 66.1091C126.99 30.145 135.051 28.8522 137.664 28.1093C145.571 25.861 150.235 37.6508 154.137 39.8203C158.039 41.9898 178.274 51.5375 181.319 43.0217C184.363 34.506 160.092 10.8016 137.966 13.8137Z"
            fill="#272727"
          />
          <circle
            cx="97.7985"
            cy="121.94"
            r="5.2605"
            fill="white"
            stroke="white"
            strokeWidth="2.10242"
          />
          <circle cx="97.7985" cy="130.35" r="6.31171" fill="#272727" />
          <circle
            cx="135.695"
            cy="121.94"
            r="5.2605"
            fill="white"
            stroke="white"
            strokeWidth="2.10242"
          />
          <rect
            x="103.063"
            y="101.006"
            width="10.5299"
            height="3.24389"
            rx="1.62195"
            transform="rotate(-180 103.063 101.006)"
            fill="#D5D5D5"
            stroke="#D5D5D5"
            strokeWidth="2.10242"
          />
          <rect
            x="140.96"
            y="101.006"
            width="10.5299"
            height="3.24389"
            rx="1.62195"
            transform="rotate(-180 140.96 101.006)"
            fill="#D5D5D5"
            stroke="#D5D5D5"
            strokeWidth="2.10242"
          />
          <rect
            x="-1.08443"
            y="0.482168"
            width="6.20746"
            height="1.67759"
            rx="0.838793"
            transform="matrix(-0.359278 0.933231 -0.93357 -0.358396 83.7905 133.221)"
            stroke="#FF5959"
            strokeWidth="1.67759"
          />
          <rect
            x="-1.08443"
            y="0.482168"
            width="6.20746"
            height="1.67759"
            rx="0.838793"
            transform="matrix(-0.359278 0.933231 -0.93357 -0.358396 146.952 129.015)"
            stroke="#FF5959"
            strokeWidth="1.67759"
          />
          <rect
            x="-1.08443"
            y="0.482168"
            width="6.20746"
            height="1.67759"
            rx="0.838793"
            transform="matrix(-0.359278 0.933231 -0.93357 -0.358396 90.1065 133.221)"
            stroke="#FF5959"
            strokeWidth="1.67759"
          />
          <rect
            x="-1.08443"
            y="0.482168"
            width="6.20746"
            height="1.67759"
            rx="0.838793"
            transform="matrix(-0.359278 0.933231 -0.93357 -0.358396 153.268 129.015)"
            stroke="#FF5959"
            strokeWidth="1.67759"
          />
          <path
            d="M40.8087 81.103C42.394 80.8524 43.3955 82.751 42.2934 83.9176L32.3357 94.4585C32.0058 94.8078 31.8409 95.2813 31.8826 95.7596L33.0481 109.119C33.1847 110.684 31.2887 111.566 30.1795 110.453L20.7041 100.943C20.3658 100.604 19.8986 100.425 19.4198 100.451L4.9254 101.252C3.32282 101.341 2.5194 99.3503 3.73444 98.3015L14.0826 89.3686C14.5076 89.0018 14.7216 88.4475 14.6533 87.8908L12.8614 73.2763C12.6629 71.6579 14.6546 70.7315 15.7645 71.926L25.7975 82.7234C26.1786 83.1335 26.7391 83.327 27.2924 83.2395L40.8087 81.103Z"
            fill="#FFBC02"
          />
          <path
            d="M225.484 113.751C226.99 114.309 226.933 116.454 225.401 116.932L220.445 118.475C219.986 118.618 219.611 118.95 219.413 119.386L217.456 123.702C216.806 125.133 214.721 124.971 214.301 123.457L213.032 118.893C212.904 118.431 212.584 118.046 212.153 117.834L207.494 115.547C206.054 114.84 206.328 112.711 207.901 112.392L212.485 111.461C213.034 111.349 213.492 110.972 213.706 110.454L215.657 105.717C216.278 104.21 218.469 104.38 218.85 105.965L220.048 110.944C220.179 111.489 220.574 111.933 221.1 112.127L225.484 113.751Z"
            fill="#FF3A3A"
          />
          <path
            d="M22.775 140.209C24.3603 139.959 25.3618 141.857 24.2597 143.024L22.6189 144.761C22.2889 145.11 22.124 145.584 22.1658 146.062L22.351 148.185C22.4876 149.751 20.5916 150.633 19.4824 149.519L17.9733 148.005C17.6351 147.665 17.1679 147.486 16.689 147.513L14.2967 147.645C12.6941 147.734 11.8907 145.743 13.1057 144.694L14.5975 143.406C15.0224 143.04 15.2365 142.485 15.1682 141.929L14.896 139.709C14.6976 138.091 16.6892 137.164 17.7992 138.359L19.3263 140.002C19.7074 140.412 20.2678 140.606 20.8212 140.518L22.775 140.209Z"
            fill="#448FFF"
          />
          <path
            d="M235.374 141.547C236.879 142.105 236.823 144.25 235.29 144.728L233.005 145.44C232.546 145.582 232.171 145.914 231.973 146.35L231.091 148.295C230.442 149.726 228.357 149.564 227.936 148.05L227.365 145.994C227.236 145.532 226.916 145.147 226.485 144.935L224.337 143.881C222.897 143.174 223.171 141.045 224.744 140.726L226.68 140.332C227.23 140.221 227.687 139.843 227.901 139.325L228.754 137.254C229.375 135.747 231.566 135.917 231.947 137.502L232.471 139.678C232.602 140.223 232.996 140.667 233.522 140.862L235.374 141.547Z"
            fill="#FFBC02"
          />
          <circle cx="135.695" cy="130.35" r="6.31171" fill="#272727" />
          <path
            d="M123.065 130.35H112.533C111.371 130.35 110.422 131.291 110.445 132.452C110.546 137.582 111.354 144.015 117.799 144.015C124.155 144.015 125.029 137.237 125.149 132.45C125.178 131.289 124.227 130.35 123.065 130.35Z"
            fill="#FF5959"
          />
          <mask
            id="mask0_509_5526"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="110"
            y="130"
            width="16"
            height="15"
          >
            <path
              d="M123.065 130.35H112.533C111.371 130.35 110.422 131.291 110.445 132.452C110.546 137.582 111.354 144.015 117.799 144.015C124.155 144.015 125.029 137.237 125.149 132.45C125.178 131.289 124.227 130.35 123.065 130.35Z"
              fill="#FF5959"
            />
          </mask>
          <g mask="url(#mask0_509_5526)">
            <path
              d="M123.065 119.838H112.533C111.371 119.838 110.422 120.779 110.445 121.94C110.546 127.07 111.354 133.504 117.799 133.504C124.155 133.504 125.029 126.725 125.149 121.938C125.178 120.778 124.227 119.838 123.065 119.838Z"
              fill="white"
            />
          </g>
          <path
            d="M43.0597 201.832C35.8388 174.921 53.0341 169.595 63.0607 169.245L80.9564 181.859C87.2726 185.013 96.0756 189.385 90.4308 171.347C85.1673 154.527 89.3779 146.468 96.7468 144.015C98.8523 144.015 104.537 141.913 110.432 154.527C117.801 170.296 99.9049 233.554 80.9564 238.624C62.0079 243.694 52.0859 235.471 43.0597 201.832Z"
            fill="#171717"
          />
          <path
            d="M196.342 200.912C203.563 174.001 186.368 168.675 176.341 168.325L158.446 180.939C152.13 184.093 143.327 188.465 148.971 170.427C154.235 153.608 150.024 145.548 142.655 143.095C140.55 143.095 134.865 140.993 128.97 153.608C121.601 169.376 139.497 232.634 158.446 237.704C177.394 242.774 187.316 234.551 196.342 200.912Z"
            fill="#171717"
          />
        </svg>
      </div>

      {/* ===== 문제별 결과 카드 ===== */}
      <div
        style={{
          position: "absolute",
          top: "530px", 
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 40px",
          gap: "10px",
          width: "380px",
          height: "108px",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* 문제 번호 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "60px",
            width: "296px",
            height: "28px",
          }}
        >
          {results.map((_, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "28px",
                height: "28px",
                borderRadius: "14px",
                background: "#448FFF",
                fontFamily: "Roboto, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "16px",
                color: "#FFFFFF",
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>

        {/* O/X 결과 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "56px",
            width: "296px",
            height: "32px",
            justifyContent: "center",
          }}
        >
          {results.map((r, idx) => {
            const isCorrect = r && r.correct === true;
            return (
              <div
                key={idx}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isCorrect ? (
                  // 정답 O 
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "6px solid #2EBA4C",
                      borderRadius: "50%",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  // 오답 X
                  <div style={{ width: 30, height: 30, display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28.5079 26.1836L17.3188 15.0006L28.5079 3.89999C29.0686 3.25055 29.0383 2.27594 28.4382 1.66315C27.8381 1.05036 26.8707 1.00597 26.2177 1.56128L14.9959 12.5796L3.97035 1.47893C3.33231 0.840357 2.30186 0.840357 1.66382 1.47893C1.35414 1.78818 1.17994 2.20914 1.17994 2.64829C1.17994 3.08743 1.35414 3.50839 1.66382 3.81764L12.673 14.9018L1.48388 25.986C1.17419 26.2952 1 26.7162 1 27.1554C1 27.5945 1.17419 28.0155 1.48388 28.3247C1.79259 28.633 2.21051 28.8049 2.64532 28.8023C3.07216 28.8049 3.48309 28.6394 3.79041 28.3412L14.9959 17.2241L26.2177 28.5224C26.5264 28.8306 26.9444 29.0025 27.3792 29C27.8083 28.9982 28.2196 28.8266 28.5242 28.5224C28.8318 28.2109 29.003 27.7887 29 27.3496C28.9969 26.9104 28.8197 26.4907 28.5079 26.1836Z" fill="#FF5959" stroke="#FF5959" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 프리미엄 안내 말풍선  */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: premiumBubbleBottom,
          width: '348px',
          height: '52px', 
          pointerEvents: 'none',
          zIndex: 130,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '348px',
            height: '40px',
            left: 0,
            top: 0,
            background: '#FFFFFF',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            lineHeight: '14px',
            color: '#474747',
            boxShadow: '0px 0px 12px rgba(0,0,0,0.16)'
          }}
        >
          프리미엄 가입시, 틀린 문제를 다시 확인할 수 있어요!
        </div>
        <div
          style={{
            position: 'absolute',
            width: '24.49px',
            height: '12px',
            left: '50%',
            top: '40px',
            transform: 'translateX(-50%)',
            background: '#FFFFFF',
            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
            boxShadow: '0px 0px 12px rgba(0,0,0,0.16)'
          }}
        />
      </div>

      <FloatingQuizCTA
        stackIndex={0}
        label="홈으로 가기"
        onClick={onExplore}
        gradient={false}
        shadow={false}
        style={{ pointerEvents: 'none' }}
        buttonStyle={{ pointerEvents:'auto' }}
      />
      <FloatingQuizCTA
        stackIndex={1}
        label={score === 0 ? '다시하기' : '오답노트 확인하기'}
        onClick={score === 0 ? onRetry : () => navigate('/study?tab=wrong')}
        gradient
      />
    </div>
  );
}