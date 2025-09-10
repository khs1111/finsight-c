import React, { useState } from "react";

export default function ExploreMain({ onStart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const today = new Date().getDate(); // 오늘 날짜
const weekDates = Array.from({ length: 7 }, (_, i) => today - 3 + i); // 오늘 기준으로 -3 ~ +3
// 문제 푼 날짜 (예시)
const [solvedDates, setSolvedDates] = React.useState([today]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "917px",
        background: "#F4F6FA",
        overflowY: "auto",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* ✅ 상단 토픽/난이도/햄버거 메뉴 */}
      <div
        style={{
          position: "absolute",
          top: "64px",
          left: "16px",
          width: "380px",
          height: "30px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 난이도 + 토픽 + 화살표 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            height: "30px",
          }}
        >
          {/* 난이도 뱃지 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px 12px",
              background: "#448FFF",
              borderRadius: "8px",
              width: "58px",
              height: "30px",
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              초급자
            </span>
          </div>

          {/* 토픽명 */}
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#474747",
            }}
          >
            은행 - 예금/적금
          </span>

          {/* ▼ 드롭다운 화살표 자리 */}
          <div
            style={{
              width: "20px",
              height: "20px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.0173 5C16.6805 5 16.3436 5.12807 16.0866 5.38509L9.99975 11.4728L3.9129 5.38509C3.39887 4.87193 2.56553 4.87193 2.05149 5.38509C1.53834 5.89912 1.53834 6.73246 2.05149 7.24649L9.06905 14.264C9.58308 14.7772 10.4164 14.7772 10.9305 14.264L17.948 7.24649C18.4612 6.73246 18.4612 5.89912 17.948 5.38509C17.691 5.12807 17.3541 5 17.0173 5Z" fill="#474747"/>
</svg>

          </div>
        </div>

        {/* 햄버거 버튼 */}
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "1px",
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 18C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H20C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H4ZM4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4ZM4 8C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4Z" fill="#474747"/>
</svg>

        </div>

        {/* 햄버거 드롭다운 메뉴 */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "38px",
              right: "0px",
              width: "82px",
              height: "76px",
              background: "#FFFFFF",
              boxShadow: "0px 0px 16px rgba(10, 26, 51, 0.32)",
              borderRadius: "16px",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 20,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#282828",
              }}
            >
              단어장
            </div>
            <div
              style={{
                border: "1px solid #F5F5F5",
                width: "100%",
              }}
            />
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#282828",
              }}
            >
              오답노트
            </div>
          </div>
        )}
      </div>

      {/* ✅ 출석/진행도 섹션 (위치만 맞춰 예시) */}
      <div
  style={{
    position: "absolute",
    top: "106px",
    left: "calc(50% - 380px/2)",
    width: "380px",
    height: "80px",
    background: "#FFFFFF",
    boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
    borderRadius: 16,
    padding: "12px 0",
  }}
>
  {/* 날짜 (요일/일자) */}
  <div style={{ display: "flex", justifyContent: "space-around" }}>
    {weekDates.map((date) => (
      <div
        key={date}
        style={{
          color: date === today ? "#448FFF" : "#B2B2B2",
          fontSize: "12px",
          fontWeight: 500,
          display: "flex",
        flexDirection: "column", 
        alignItems: "center",    
        width: 32,  
        }}
      >
        {date}
      </div>
    ))}
  </div>

  {/* 출석 체크 표시 */}
<div style={{  display: "flex",
    justifyContent: "space-around",
     marginTop: 8 }}>
  {weekDates.map((date) => (
    <div key={date}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.1244 4.55018C10.4124 3.61856 11.2793 2.9877 12.2544 3.00018C13.2349 2.99033 14.1036 3.63063 14.3844 4.57018L15.0444 6.57018C15.3408 7.49581 16.2025 8.12289 17.1744 8.12018H19.2544C20.2492 8.08249 21.1495 8.70582 21.4643 9.65023C21.7791 10.5946 21.4328 11.6335 20.6144 12.2002L18.9044 13.4502C18.1162 14.0163 17.7846 15.0272 18.0844 15.9502L18.7444 17.9502C18.9712 18.6425 18.8487 19.4019 18.4157 19.9878C17.9827 20.5737 17.2928 20.9137 16.5644 20.9002C16.092 20.8966 15.6331 20.7425 15.2544 20.4602L13.6144 19.2102C12.8279 18.6365 11.7609 18.6365 10.9744 19.2102L9.25439 20.4602C8.87111 20.7686 8.39625 20.9409 7.90439 20.9502C7.17067 20.9563 6.48006 20.6042 6.05396 20.0069C5.62785 19.4095 5.51978 18.642 5.76439 17.9502L6.42439 15.9502C6.74237 15.03 6.42662 14.0098 5.64439 13.4302L3.93439 12.1802C3.14176 11.6115 2.8083 10.5953 3.10992 9.66755C3.41154 8.73983 4.27889 8.11399 5.25439 8.12018H7.33439C8.31172 8.12014 9.17514 7.48372 9.46439 6.55018L10.1244 4.55018Z"
          fill={solvedDates.includes(date) ? "#FFBC02" : "#B0B0B0"} // ✅ 출석 여부에 따라 색상 변경
        />
      </svg>
    </div>
  ))}
</div>
</div>

      {/* ✅ 징검다리 진행도 (8단계 표시 가능) */}
      <div
        style={{
          position: "absolute",
          top: "220px",
          left: "16px",
          right: "16px",
          height: "120px",
          background: "transparent",
        }}
      >
        {/* TODO: 진행도 원형 아이콘 8개 배치 */}
      </div>

      {/* ✅ 퀴즈 풀러가기 버튼 */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "16px",
          width: "380px",
          height: "60px",
          background:
            "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#FFFFFF",
          fontSize: "18px",
          fontWeight: "700",
          cursor: "pointer",
        }}
        onClick={onStart}
      >
        퀴즈 풀러가기
      </div>
    </div>
  );
}
