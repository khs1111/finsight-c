import React from 'react';
import './modifyProfile.css';
import { ReactComponent as BackIcon } from '../../assets/profile/modifyProfile/backIcon.svg';
import Icon_avatar from '../../assets/profile/modifyProfile/3d_avatar_7.png';
import { resolveAssetUrl } from '../../utils/path';

export default function ModifyProfile({ profile = {}, onClose = () => {} }) {
  const { nickname = '', email = '' } = profile;
  return (
    <div className="modify-wrapper" role="dialog" aria-label="프로필 수정">
      <div className="modify-topbar">
          <button className="back-btn" type="button" onClick={onClose} aria-label="뒤로">
          <BackIcon width={20} height={20} aria-hidden="true" focusable="false" />
        </button>
        <div className="modify-title">프로필</div>
      </div>

      <div className="modify-content">
        <div className="avatar-area">
          <div className="avatar-circle" aria-hidden="true">
            <img src={resolveAssetUrl(Icon_avatar)} alt="avatar" />
          </div>
        </div>

        <div className="modify-form">
          <label className="input-label"></label>
          <input className="text-input" defaultValue={nickname} placeholder="파니의 동료" />

          <label className="input-label"></label>
          <input className="text-input" defaultValue={email} placeholder="이메일" />

          <label className="input-label"></label>
          <input className="text-input" type="password" placeholder="비밀번호 변경" />
          <label className="input-label"></label>
          <input className="text-input" type="password" placeholder="비밀번호 확인" />

        </div>
      </div>

      <div className="modify-footer">
        <button className="complete-btn" type="button" onClick={onClose}>완료</button>
      </div>
    </div>
  );
}