import { useWrongNoteStore } from './useWrongNoteStore';
import Illustration from '../../assets/wrongNoteIllustration.svg';

const CATEGORY_ORDER = ['은행', '투자', '세금/절세', '암호화폐'];

export default function WrongNoteSection() {
  const { wrongNotes } = useWrongNoteStore();
  const total = wrongNotes.length;
  const counts = CATEGORY_ORDER.map(cat => ({
    category: cat,
    count: wrongNotes.filter(w => w.category === cat).length
  }));
  const empty = total === 0;

  return (
    <div className="wrongnote-wrapper" role="region" aria-label="오답노트">
      <div className="wrongnote-header-block">
        <h2 className="wrongnote-title-line">틀린 문제를 정리해보았어요!</h2>
        {!empty && <div className="wrongnote-total-overlay">총 {total}개</div>}
        {!empty && (
          <img src={Illustration} alt="오답 일러스트" className="wrongnote-float-illust" />
        )}
      </div>
      {empty ? (
        <div className="wrongnote-empty">
          <img src={Illustration} alt="오답 노트 일러스트" className="wrongnote-illust" />
          <h3>틀린 문제가 아직 없어요</h3>
          <p className="helper">문제를 풀면 여기에서 다시 복습할 수 있어요.</p>
        </div>
      ) : (
        <>
          <ul className="wrongnote-category-list">
            {counts.map(item => (
              <li key={item.category} className="wrongnote-cat-card">
                <div className="cat-left">{item.category}</div>
                <div className="cat-right">
                  <span className="cat-count">{item.count}개</span>
                  <span className="cat-chevron" aria-hidden>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.99983 20.7498C8.19889 20.7508 8.38994 20.6715 8.52983 20.5298L16.5298 12.5298C16.8223 12.237 16.8223 11.7627 16.5298 11.4698L8.52983 3.46985C8.23432 3.19449 7.77382 3.20261 7.48821 3.48823C7.20259 3.77384 7.19447 4.23434 7.46983 4.52985L14.9398 11.9998L7.46983 19.4698C7.17737 19.7627 7.17737 20.237 7.46983 20.5298C7.60971 20.6715 7.80076 20.7508 7.99983 20.7498Z" fill="#4D4D4D"/>
                    </svg>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
