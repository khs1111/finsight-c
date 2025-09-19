import React from 'react';
import { SAMPLE_ARTICLES } from './feedData';

export default function MyNewsPreview({ onClickArticle }) {
  const top = SAMPLE_ARTICLES.slice(0,3);
  return (
    <div style={wrap}>
      <div style={titleRow}>내가 곧 보게 될 맞춤 뉴스</div>
      <div style={list}>
        {top.map(a => (
          <button key={a.id} style={itemBtn} onClick={() => onClickArticle && onClickArticle(a)}>
            <span style={chip}>{a.category}</span>
            <span style={itemTitle}>{truncate(a.title, 26)}</span>
          </button>
        ))}
      </div>
      <div style={hint}>관심사 선택 후 더 정확해져요</div>
    </div>
  );
}

const wrap = { width:120, height:120, borderRadius:24, background:'linear-gradient(135deg,#448FFF,#4833D0)', padding:10, boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'space-between', color:'#fff' };
const titleRow = { fontSize:11, fontWeight:600, lineHeight:'14px', letterSpacing:'-0.02em' };
const list = { display:'flex', flexDirection:'column', gap:6 };
const itemBtn = { textAlign:'left', background:'rgba(255,255,255,0.14)', border:'none', borderRadius:10, padding:'4px 6px 6px', display:'flex', flexDirection:'column', gap:4, cursor:'pointer' };
const chip = { display:'inline-block', background:'rgba(255,255,255,0.22)', padding:'2px 6px', fontSize:10, fontWeight:500, borderRadius:30 };
const itemTitle = { fontSize:11, fontWeight:600, color:'#fff', lineHeight:'13px' };
const hint = { fontSize:10, fontWeight:400, opacity:0.85 };

function truncate(str, max){ return str.length > max ? str.slice(0,max-1)+'…' : str; }
