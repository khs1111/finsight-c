import React from 'react';
import { useNavigate } from 'react-router-dom';
import './paymentPage.css';
import { resolveAssetUrl } from '../../utils/path';
import { ReactComponent as AntIcon} from '../../assets/profile/paymentPage/ant.svg';
import { ReactComponent as BackIcon } from '../../assets/profile/modifyProfile/backIcon.svg';
import BellIcon from '../../assets/profile/paymentPage/bell-icon.png';
import FinanceIcon from '../../assets/profile/paymentPage/finance-icon.png';
import { ReactComponent as RectangleIcon } from '../../assets/profile/paymentPage/Rectangle.svg';
import TargetIcon from '../../assets/profile/paymentPage/target-icon.png';

export default function PaymentPage() {
  const navigate = useNavigate();
  return (
    <div className="payment-wrapper">
      <div className="payment-topbar">
        <button className="back-btn" type="button" onClick={() => navigate('/profile')} aria-label="뒤로">
          <BackIcon width={20} height={20} aria-hidden="true" focusable="false" />
        </button>
        <div className="payment-title">프리미엄 구독하기</div>
      </div>

      <div className="payment-content">
            <div className="payment-hero">
              <AntIcon width={120} height={120} aria-hidden="true" focusable="false" />
            </div>
        <h2 className="payment-heading">모든 서비스를 4,900원에 만나보세요</h2>
        <p className="payment-desc">관심 분야와 투자 성향에 맞는 맞춤형 뉴스레터를 구독하고 더 스마트한 투자가 되어보세요!</p>

        <ul className="payment-features">
          <li className="feature">
            <RectangleIcon className="feature-icon" aria-hidden="true" focusable="false" />
            <div className="feature-body">
              <div className="feature-title">기사 읽기 도우미</div>
              <div className="feature-sub">1일 3회 - 무제한 읽기</div>
            </div>
          </li>

          <li className="feature">
            <img className="feature-icon" src={resolveAssetUrl(TargetIcon)} alt="맞춤형 콘텐츠 아이콘" />
            <div className="feature-body">
              <div className="feature-title">맞춤형 콘텐츠</div>
              <div className="feature-sub">나에게 필요한 정보만 받을 수 있어요.</div>
            </div>
          </li>

          <li className="feature">
            <img className="feature-icon" src={resolveAssetUrl(FinanceIcon)} alt="무제한 퀴즈 아이콘" />
            <div className="feature-body">
              <div className="feature-title">무제한 퀴즈</div>
              <div className="feature-sub">재미있게 경제 공부를 시작하세요.</div>
            </div>
          </li>

          <li className="feature">
            <img className="feature-icon" src={resolveAssetUrl(BellIcon)} alt="카카오톡 알림 아이콘" />
            <div className="feature-body">
              <div className="feature-title">카카오톡 알림</div>
              <div className="feature-sub">실시간 맞춤 알림 서비스 제공</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="payment-footer">
        <button className="subscribe-btn" type="button" onClick={() => alert('구독 완료되었습니다.')}>구독하기</button>
      </div>
    </div>
  );
}
