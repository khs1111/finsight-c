import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './contact.css';
import { ReactComponent as BackIcon } from '../../assets/profile/modifyProfile/backIcon.svg';

export default function Contact() {
	const navigate = useNavigate();
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	const handleSubmit = () => {
		// 실제 전송 API 연결 전, 더미 동작
		if (!title.trim() || !content.trim()) {
			alert('제목과 문의 내용을 입력해주세요.');
			return;
		}
		alert('문의가 전송되었습니다. (더미)');
		navigate('/profile');
	};

	return (
		<div className="contact-wrapper">
			<div className="contact-topbar">
				<button className="back-btn" type="button" onClick={() => navigate('/profile')} aria-label="뒤로">
					<BackIcon width={20} height={20} aria-hidden="true" focusable="false" />
				</button>
				<div className="contact-title">개발자에게 문의하기</div>
			</div>

			<div className="contact-content">
				<div className="field">
					<label htmlFor="contact-title" className="input-label"></label>
					<input
						id="contact-title"
						className="text-input"
						type="text"
						placeholder="제목을 입력해주세요"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>

				<div className="field">
					<label htmlFor="contact-content" className="input-label"></label>
					<textarea
						id="contact-content"
						className="text-area"
						placeholder="문의 내용을 입력해주세요"
						rows={8}
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
				</div>
			</div>

			<div className="contact-footer">
				<button className="send-btn" type="button" onClick={handleSubmit}>전송</button>
			</div>
		</div>
	);
}

