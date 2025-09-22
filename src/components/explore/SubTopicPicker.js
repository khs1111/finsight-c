//주제 상세
export default function SubTopicPicker({ topic, onConfirm }) {
  const [selectedSub, setSelectedSub] = useState(null);
  const subTopics = subTopicMap[topic] || [];

  return (
    <div
      style={{
        maxWidth: "auto", 
        width: "100%",
        minHeight: "auto",
        margin: "0 auto",
        background: "#F4F6FA",
        padding: "276px 16px 16px", 
      }}
    >
      <TopicCard title={topic} active={true} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",        
          background: "#FFFFFF",
          boxShadow: "0px 0px 4px rgba(0,0,0,0.25)",
          borderRadius: "0px 0px 8px 8px",
          marginTop: "-1px",     
        }}
      >
        {subTopics.map((st, idx) => (
          <div
            key={st}
            onClick={() => setSelectedSub(st)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px",
              height: "53px",
              fontFamily: "Roboto, sans-serif",
              fontSize: "18px",
              lineHeight: "21px",
              color: "#474747",
              borderBottom:
                idx !== subTopics.length - 1 ? "1px solid #F5F5F5" : "none",
              background: selectedSub === st ? "#EAF2FF" : "#FFFFFF",
              cursor: "pointer",
            }}
          >
            {st}
          </div>
        ))}
      </div>

      <button
        onClick={() => onConfirm(selectedSub)}
        disabled={!selectedSub}
        style={{
          marginTop: "20px",
          width: "100%",          
          height: "60px",
          background: selectedSub
            ? "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)"
            : "#CACACA",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          borderRadius: "8px",
          cursor: selectedSub ? "pointer" : "not-allowed",
        }}
      >
        확인
      </button>
    </div>
  );
}
