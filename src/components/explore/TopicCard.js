//주제 드롭다운 카드
export default function TopicCard({ title, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        gap: "10px",
        width: "100%",          
        height: "60px",
        background: active ? "#448FFF" : "#FFFFFF",
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        borderRadius: active ? "8px 8px 0 0" : "8px",
        fontFamily: "Roboto, sans-serif",
        fontWeight: active ? 700 : 400,
        fontSize: "18px",
        lineHeight: "21px",
        color: active ? "#FFFFFF" : "#4D4D4D",
        cursor: "pointer",
      }}
    >
      <span>{title}</span>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={active ? "M18 15L12 9L6 15" : "M6 9L12 15L18 9"}
          stroke={active ? "#FFFFFF" : "#999999"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
