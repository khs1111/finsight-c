//징검다리
import React from "react";
import steppingPath from "../../assets/steppingPath.svg";
import stepDone from "../../assets/step-done.svg";
import stepLocked from "../../assets/step-locked.svg";
import antCharacter from "../../assets/antCharacter.svg";

export default function SteppingStones({ total = 7, done = 0 }) {

  const positions = [
    { left: 74, top: 264 },
    { left: 235, top: 242 },
    { left: 34, top: 392 },
    { left: 172, top: 432 },
    { left: 302, top: 484 },
    { left: 292, top: 617 },
    { left: 172, top: 665 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "412px",
        height: "917px",
        margin: "0 auto",
      }}
    >
      {/* 징검다리 */}
      <img
        src={steppingPath}
        alt="stepping path"
        style={{
          position: "absolute",
          left: 61,
          top: 111,
          width: 292,
          height: 590,
        }}
      />

      {/* 단계 */}
      {positions.map((pos, idx) => {
        if (idx < done) {
          return (
            <img
              key={idx}
              src={stepDone}
              alt="done"
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                width: 68,
                height: 68,
              }}
            />
          );
        } else if (idx === done) {
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                width: 68,
                height: 68,
              }}
            >
              <img
                src={stepLocked}
                alt="current"
                style={{ width: "100%", height: "100%" }}
              />
              {/* 캐릭터 */}
              <img
                src={antCharacter}
                alt="ant"
                style={{
                  position: "absolute",
                  left: -10,
                  top: -50,
                  width: 80,
                  height: 80,
                }}
              />
            </div>
          );
        } else {
          return (
            <img
              key={idx}
              src={stepLocked}
              alt="locked"
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                width: 68,
                height: 68,
              }}
            />
          );
        }
      })}
    </div>
  );
}
