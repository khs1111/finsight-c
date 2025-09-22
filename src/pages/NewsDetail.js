import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleDetail } from '../api/news';
import './NewsDetail.css';
import BookmarkIcon from '../assets/newspng/Bookmark.svg';
import LinkAltIcon from '../assets/newspng/link_alt.svg';
import EllipsePoint from '../assets/newspng/Ellipse 212.svg';

// --- 1단계: 단위(Unit) 매핑 객체 및 함수 추가 ---
const INDICATOR_UNITS = {
  "kr.cpi.headline.m": "(2024=100)", // 소비자물가지수
  "kr.ppi.m": "(2024=100)",          // 생산자물가지수
  "kr.base.rate.d": "%",             // 기준금리
  "fx.usdkrw.m": "원",               // 환율
  "kr.current.account.m": "백만 달러", // 경상수지
  "kr.kospi.d": "포인트"             // KOSPI
};

// indicator_id를 받아서 해당하는 단위를 돌려주는 함수
const getUnitForIndicator = (indicatorId) => {
  return INDICATOR_UNITS[indicatorId] || ''; // ID가 없으면 빈 문자열 반환
};


// 유틸: 날짜 파싱 및 시계열 규칙성 판단
const parseToDate = (d) => {
  try {
    // 지원: YYYY, YYYY-MM, YYYY-MM-DD
    if (typeof d === 'number') return new Date(d, 0, 1);
    if (typeof d === 'string') {
      if (/^\d{4}$/.test(d)) return new Date(Number(d), 0, 1);
      return new Date(d);
    }
    if (d instanceof Date) return d;
  } catch {}
  return null;
};

const monthsBetween = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

const isRegularTimeSeries = (frequency, observations) => {
  if (!Array.isArray(observations) || observations.length < 4) return false;
  const dates = observations
    .map(o => parseToDate(o.date))
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (dates.length < 4) return false;
  const expectedStep = frequency === 'M' ? 1 : frequency === 'Q' ? 3 : 12; // default: yearly
  for (let i = 1; i < dates.length; i++) {
    const step = monthsBetween(dates[i - 1], dates[i]);
    if (step !== expectedStep) return false;
  }
  return true;
};

// 막대 차트 (단위 표시 기능 추가)
const SimpleChart = ({ title, description, data }) => {
  if (!data || !data.observations || data.observations.length === 0) {
    return null;
  }
  
  const chartData = data.observations.slice(-5);
  const maxValue = Math.max(...chartData.map(item => item.value));
  
  return (
    <div className="chart-container">
       {/* LineChart와 통일된 헤더 구조 적용 */}
      <div className="chart-title-area">
        <h4 className="chart-header">{title}</h4>
        {data.unit && <span className="chart-unit">단위 : {data.unit}</span>}
      </div>
      <div className="chart">
        {chartData.map((item, idx) => {
          const date = new Date(item.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          
          return (
            <div key={idx} className="chart-bar">
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
                {item.value.toFixed(1)}%
              </div>
              <div 
                className={`bar ${idx === chartData.length - 1 ? 'active' : ''}`} 
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  width: '20px', 
                  borderRadius: '4px',
                  transition: 'height 0.3s ease'
                }} 
              />
              <span className="bar-label">{month === 1 ? year : `${month}월`}</span>
            </div>
          );
        })}
      </div>
      {description && <p className="chart-description right">{description}</p>}
    </div>
  );
};

// 꺾은선 차트 (최종 수정본: 반응형, 직선, 동적 단위)
const LineChart = ({ title, description, data }) => {
  if (!data || !Array.isArray(data.observations) || data.observations.length < 2) return null;

  const chartData = data.observations.slice(-5);
  const values = chartData.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const W = 100;
  const H = 100;
  const P = 8;

  const pad = Math.max((maxValue - minValue) * 0.2, 0.0001);
  const yMin = minValue - pad;
  const yMax = maxValue + pad;
  const yRange = Math.max(yMax - yMin, 0.0001);

  const points = chartData.map((d, i) => {
    const x = P + (i / (chartData.length - 1)) * (W - 2 * P);
    const y = P + (1 - ((d.value - yMin) / yRange)) * (H - 2 * P);
    return { x, y, value: d.value, date: d.date };
  });
  
  // SVG Path 'd' 속성값 생성 (직선)
  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
  ).join(' ');


  return (
    <div className="line-chart-wrap">
      <div className="chart-title-area">
        <h4 className="chart-header">{title}</h4>
        {data.unit && <span className="chart-unit">단위 : {data.unit}</span>}
      </div>
      
      <div className="line-chart-area">
        <svg className="line-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <path d={pathD} className="line-path" />
        </svg>

        {points.map((p, idx) => {
          const isLast = idx === points.length - 1;
          return (
            <React.Fragment key={idx}>
              {isLast ? (
                <div className="final-value-badge" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  {p.value.toFixed(1)}
                </div>
              ) : (
                <div className="data-value-label" style={{ left: `${p.x}%`, top: `${p.y}%` }}> {/* top을 p.y%로 변경 */}
                  {p.value.toFixed(1)}
                </div>
              )}
              
              <img
                src={EllipsePoint}
                alt=""
                className="line-point-img"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              />
            </React.Fragment>
          );
        })}

        {/* X축 라벨을 포인트의 x 좌표와 정확히 일치하도록 절대 위치로 배치 */}
        <div className="line-xlabels-abs">
          {points.map((p, i) => {
            const d = parseToDate(p.date);
            let label = '';
            if (d) {
              if (String(p.date).includes('~')) {
                label = p.date;
              } else {
                const m = d.getMonth() + 1;
                label = m === 1 ? d.getFullYear() : `${m}월`;
              }
            }
            return (
              <span key={i} className="xlabel-abs" style={{ left: `${p.x}%` }}>{label}</span>
            );
          })}
        </div>
      </div>

      {/* 아래 여백은 유지하여 라벨이 카드 밖으로 겹치지 않도록 함 */}
      <div style={{ height: 18 }} />
      
      {description && <p className="chart-description">{description}</p>}
    </div>
  );
};


// 차트 선택기: 규칙적인 시계열이면 꺾은선, 아니면 막대
const ChartSwitcher = ({ series, reason }) => {
  if (!series || !Array.isArray(series.observations) || series.observations.length === 0) return null;
  const { name, frequency } = series;
  const useLine = isRegularTimeSeries(frequency, series.observations);
  return useLine ? (
    <LineChart title={name || '시계열 추이'} description={reason} data={series} />
  ) : (
    <SimpleChart title={name || '지표 비교'} description={reason} data={series} />
  );
};


export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);
  
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getArticleDetail(parseInt(id));
        setArticle(data);
      } catch (err) {
        console.error('뉴스 상세 정보 로딩 실패:', err);
        setError('뉴스 상세 정보를 불러오는데 실패했습니다.');
        
        setArticle({
          id: parseInt(id),
          title: "뉴스 제목을 불러올 수 없습니다",
          description: "뉴스 내용을 불러오는 중 오류가 발생했습니다.",
          category: "일반",
          published_at: new Date().toISOString(),
          url: "",
          background: [],
          keywords: [],
          related_statistics: [],
          statistics_data: [],
          images: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: '#F5F5F5',
        minHeight: '100vh'
      }}>
        <p>뉴스를 불러오는 중...</p>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: '#F5F5F5',
        minHeight: '100vh'
      }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4263eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div className="news-detail-container">
  <div className="back-row page-gutter">
        <button
          onClick={handleGoBack}
          aria-label="뒤로가기"
          className="back-button"
        >
          <span aria-hidden="true" className="icon-24">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.9498 19.5201C11.0931 19.6553 11.2828 19.7304 11.4798 19.7301C11.6761 19.7318 11.8643 19.6521 11.9998 19.5101C12.1428 19.3708 12.2234 19.1797 12.2234 18.9801C12.2234 18.7805 12.1428 18.5894 11.9998 18.4501L6.29975 12.75H19.52C19.9342 12.75 20.27 12.4142 20.27 12C20.27 11.5858 19.9342 11.25 19.52 11.25H6.29756L12.0098 5.52006C12.1528 5.38077 12.2334 5.18965 12.2334 4.99006C12.2334 4.79048 12.1528 4.59935 12.0098 4.46006C11.717 4.16761 11.2426 4.16761 10.9498 4.46006L3.94981 11.4601C3.65736 11.7529 3.65736 12.2272 3.94981 12.5201L10.9498 19.5201Z" fill="#282828"/>
            </svg>
          </span>
          <span className="back-title">오늘의 뉴스</span>
        </button>
      </div>

  <div className="page-gutter">
        <div style={{ 
          marginTop: '10px',
          marginBottom: '2px',
          paddingLeft: 0
        }}>
          <div className="article-tag">
            {article.category_icon && (
              <img src={article.category_icon} alt="" className="article-tag-icon" />
            )}
            <span>{article.category}</span>
          </div>
        </div>
        <h1 className="article-headline" style={{
          marginTop: '0',
          marginBottom: '6px',
          paddingLeft: 0
        }}>
          {article.title}
        </h1>
        <div className="article-date" style={{ paddingLeft: 0 }}>
          {(() => {
            try {
              const d = new Date(article.published_at);
              // Asia/Seoul 기준으로 YYYY.MM.DD. HH:mm 포맷
              const z = new Intl.DateTimeFormat('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
              }).format(d);
              // 브라우저 지역 포맷의 구분 기호를 한국식으로 보정
              // 예: 2025. 09. 17. 14:32 → 그대로 사용
              return z;
            } catch {
              return new Date(article.published_at).toLocaleString('ko-KR');
            }
          })()}
        </div>
        {Array.isArray(article.hashtags) && article.hashtags.length > 0 && (
          <div className="hashtags" style={{ marginBottom: '12px' }}>
            {(showAllTags ? article.hashtags : article.hashtags.slice(0, 3)).map((tag, idx) => (
              <div key={idx} className="hashtag-chip">{tag}</div>
            ))}
            {article.hashtags.length > 3 && !showAllTags && (
              <button type="button" className="hashtag-chip hashtag-more" onClick={() => setShowAllTags(true)}>
                더보기...
              </button>
            )}
          </div>
        )}
      </div>
      
  <div className="news-content page-gutter">
        <div className="section-label" style={{
          marginBottom: '8px',
          marginTop: '40px',
          paddingLeft: 0
        }}>
          배경지식
        </div>
        <div className="section-intro" style={{
          marginTop: '0',
          marginBottom: '16px',
          paddingLeft: 0
        }}>
          {'읽기 전에 맥락 한 입,\n이해가 더 쉬워져요!'}
        </div>
        
        {/* --- 2단계: 차트 렌더링 전 단위(unit) 및 reason 주입 --- */}
        {(() => {
          const series = Array.isArray(article.statistics_data)
            ? article.statistics_data.find(s => Array.isArray(s.observations) && s.observations.length > 0)
            : null;

          if (series) {
            series.unit = getUnitForIndicator(series.indicator_id);
          }
          // related_statistics에서 동일 indicator_id의 reason을 찾음
          const reason = Array.isArray(article.related_statistics)
            ? (article.related_statistics.find(r => r.indicator_id === (series?.indicator_id))?.reason || '')
            : '';

          return series ? <ChartSwitcher series={series} reason={reason} /> : null;
        })()}
        
        {article.background && article.background.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {article.background.map((bg, idx) => (
              <div key={idx} className="background-card">
                <div className="background-card-header">
                  <div className="background-title">{bg.label}</div>
                </div>
                <div className="background-desc">{bg.content}</div>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '25px' }}>
          <div className="section-label" style={{
            marginBottom: '8px',
            paddingLeft: 0
          }}>
            용어 정리
          </div>
          <div className="section-intro" style={{
            marginBottom: '16px',
            paddingLeft: 0
          }}>
            {'읽기 전에 용어만 쏙쏙!\n뉴스가 쉬워져요.'}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {article.keywords && article.keywords.length > 0 ? (
              article.keywords.map((keyword, idx) => (
                <div key={idx} className="glossary-card">
                  <div className="glossary-card-header">
                    <div className="glossary-term-title">{keyword.term}</div>
                    <button type="button" className="bookmark-btn" aria-label="북마크">
                      <img src={BookmarkIcon} alt="" className="bookmark-icon" />
                    </button>
                  </div>
                  <div className="glossary-term-desc">{keyword.description}</div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '14px', color: '#6B7280' }}>용어 정보가 없습니다.</p>
            )}
          </div>
        </div>
        
        <div className="button-row">
          <button
            onClick={() => article.url && window.open(article.url, '_blank')}
            className="primary-button"
            style={{ gap: '4px' }}
          >
            <img src={LinkAltIcon} alt="" style={{ width: 22, height: 22 }} />
            기사 원문 보기
          </button>
        </div>
      </div>
    </div>
  );
}