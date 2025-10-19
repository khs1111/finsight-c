
import axios from 'axios';
import { API_BASE as BASE_URL } from './config';
// --------------------
// Like & Comment APIs (fetch version for direct use)
// --------------------

// 좋아요 토글
export async function togglePostLike(userId, postId) {
	 const token = localStorage.getItem('accessToken');
	 const headers = { 'Content-Type': 'application/json' };
	 if (token) headers['Authorization'] = `Bearer ${token}`;
		const response = await fetch(`${BASE_URL}/community/posts/${postId}/like?userId=${userId}`, {
		 method: 'POST',
		 headers
	 });
	if (!response.ok) {
		throw new Error('좋아요 처리 실패');
	}
	return await response.json();
}

// 좋아요 상태 확인
export async function getPostLikeStatus(userId, postId) {
	 const token = localStorage.getItem('accessToken');
	 const headers = { 'Content-Type': 'application/json' };
	 if (token) headers['Authorization'] = `Bearer ${token}`;
		const response = await fetch(`${BASE_URL}/community/posts/${postId}/like?userId=${userId}`, {
		 method: 'GET',
		 headers
	 });
	if (!response.ok) {
		throw new Error('좋아요 상태 조회 실패');
	}
	return await response.json();
}

// community.js 수정
export async function createComment(userId, postId, content) {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments?userId=${userId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: content })  // "content" → "body"로 변경
    });
    if (!response.ok) {
        throw new Error('댓글 작성 실패');
    }
    return await response.json();
}

// 댓글 목록 조회
export async function getPostComments(postId, page = 0, size = 20) {
		const token = localStorage.getItem('accessToken');
		const headers = { 'Content-Type': 'application/json' };
		if (token) headers['Authorization'] = `Bearer ${token}`;
		const response = await fetch(`${BASE_URL}/community/posts/${postId}/comments?page=${page}&size=${size}`, {
		 method: 'GET',
		 headers
		});
		if (!response.ok) {
		 throw new Error('댓글 목록 조회 실패');
		}
		const data = await response.json();
		console.log('[커뮤니티][댓글목록][응답]', data);
		return data;
}

// 댓글 수정
export async function updateComment(userId, commentId, content) {
	 const token = localStorage.getItem('accessToken');
	 const headers = { 'Content-Type': 'application/json' };
	 if (token) headers['Authorization'] = `Bearer ${token}`;
		const response = await fetch(`${BASE_URL}/community/posts/comments/${commentId}?userId=${userId}`, {
		 method: 'PUT',
		 headers,
		 body: JSON.stringify({ content })
	 });
	if (!response.ok) {
		throw new Error('댓글 수정 실패');
	}
	return await response.json();
}

// 댓글 삭제
export async function deleteComment(userId, commentId) {
	 const token = localStorage.getItem('accessToken');
	 const headers = { 'Content-Type': 'application/json' };
	 if (token) headers['Authorization'] = `Bearer ${token}`;
	 const response = await fetch(`/api/community/posts/comments/${commentId}?userId=${userId}`, {
		 method: 'DELETE',
		 headers
	 });
	if (!response.ok) {
		throw new Error('댓글 삭제 실패');
	}
	return await response.text();
}

// 사용자 댓글 목록 조회
export async function getUserComments(userId, page = 0, size = 20) {
	 const token = localStorage.getItem('accessToken');
	 const headers = { 'Content-Type': 'application/json' };
	 if (token) headers['Authorization'] = `Bearer ${token}`;
	 const response = await fetch(`/api/community/posts/comments/user/${userId}?page=${page}&size=${size}`, {
		 method: 'GET',
		 headers
	 });
	if (!response.ok) {
		throw new Error('사용자 댓글 목록 조회 실패');
	}
	return await response.json();
}

// Axios instance with JWT token support
export function getAxios(token) {
	const instance = axios.create({ baseURL: BASE_URL });
	if (token) {
		instance.interceptors.request.use(config => {
			config.headers.Authorization = `Bearer ${token}`;
			return config;
		});
	}
	return instance;
}

// --------------------
// Community Post APIs (legacy, for future expansion)
// --------------------
export const fetchCommunityPosts = ({ category, tier, page = 0, size = 20 } = {}, token) =>
	getAxios(token).get('/community/posts', {
		params: {
			category: category || undefined,
			tier: tier || undefined,
			page,
			size,
		}
	}).then(res => {
		console.log('[커뮤니티][글목록][응답]', res?.data ?? res);
		return res;
	});
export const createCommunityPost = (data, token) =>
	getAxios(token).post('/community/posts', data).then(res => {
		console.log('[커뮤니티][글작성][응답]', res?.data ?? res);
		return res;
	});
export const fetchCommunityPostDetail = (postId, token) => getAxios(token).get(`/community/posts/${postId}`);
export const createCommunityComment = (postId, data, token) => getAxios(token).post(`/community/posts/${postId}/comments`, data);
export const likeCommunityPost = (postId, token) => getAxios(token).post(`/community/posts/${postId}/like`);
// Unlike with fallbacks: try DELETE /like, then POST /unlike
export const unlikeCommunityPost = async (postId, token) => {
	const ax = getAxios(token);
	try {
		// Primary: RESTful unlike
		return await ax.delete(`/community/posts/${postId}/like`);
	} catch (_) {
		try {
			// Fallback: explicit unlike endpoint
			return await ax.post(`/community/posts/${postId}/unlike`);
		} catch (e) {
			throw e;
		}
	}
};
export const fetchMyCommunityPosts = (token) => getAxios(token).get('/community/myposts');

// --------------------
// Wrong Note (오답 노트) APIs
// --------------------

// 오답 노트 목록 조회 (fetch version)
export async function getWrongNotes(userId, page = 0, size = 20, filter = 'all') {
	 const token = localStorage.getItem('accessToken');
	 const headers = { 'Content-Type': 'application/json' };
	 if (token) headers['Authorization'] = `Bearer ${token}`;
	 const response = await fetch(`/api/wrong-notes?userId=${userId}&page=${page}&size=${size}&filter=${filter}`, {
		 method: 'GET',
		 headers
	 });
	if (!response.ok) {
		throw new Error('오답노트 조회 실패');
	}
	const wrongNotes = await response.json();
	return wrongNotes;
}

// 오답 노트 상세 조회
export function fetchWrongNoteDetail(noteId, userId, token) {
	return getAxios(token).get(`/wrong-notes/${noteId}`, {
		params: { userId }
	});
}

// 개인 메모 작성/수정
export function updateWrongNotePersonal(noteId, userId, noteMd, token) {
	return getAxios(token).put(`/wrong-notes/${noteId}/personal-note`, noteMd, {
		params: { userId },
		headers: { 'Content-Type': 'text/plain' }
	});
}

// 해결 상태 토글
export function toggleWrongNoteResolved(noteId, userId, token) {
	return getAxios(token).put(`/wrong-notes/${noteId}/toggle-resolved`, null, {
		params: { userId }
	});
}

// 복습 완료 처리
export function markWrongNoteReviewed(noteId, userId, token) {
	return getAxios(token).put(`/wrong-notes/${noteId}/mark-reviewed`, null, {
		params: { userId }
	});
}

// 오답 노트 삭제
export function deleteWrongNote(noteId, userId, token) {
	return getAxios(token).delete(`/wrong-notes/${noteId}`, {
		params: { userId }
	});
}

// 오답 노트 통계 조회
export function fetchWrongNoteStatistics(userId, token) {
	return getAxios(token).get(`/wrong-notes/statistics`, {
		params: { userId }
	});
}

// 오답 노트 생성 (틀린 시도 기록)
export function createWrongNote({ userId, quizId, questionId, selectedOptionId, correctOptionId, category, meta }, token) {
	// [REMOVED] Disabled POST /wrong-notes to prevent 405 error from quiz. No-op.
	// return getAxios(token).post(`/wrong-notes`, payload);
	return Promise.resolve({ disabled: true });
}

// --------------------
// Admin Wrong Note Statistics APIs
// --------------------

export function fetchAdminWrongNotesOverall(token) {
	return getAxios(token).get('/admin/wrong-notes/statistics/overall');
}
export function fetchAdminWrongNotesSector(sectorId, token) {
	return getAxios(token).get(`/admin/wrong-notes/statistics/sector/${sectorId}`);
}
export function fetchAdminWrongNotesSubsector(subsectorId, token) {
	return getAxios(token).get(`/admin/wrong-notes/statistics/subsector/${subsectorId}`);
}
export function fetchAdminWrongNotesQuiz(quizId, token) {
	return getAxios(token).get(`/admin/wrong-notes/statistics/quiz/${quizId}`);
}
export function fetchAdminWrongNotesDashboard(token) {
	return getAxios(token).get('/admin/wrong-notes/dashboard');
}

// --------------------
// Badge APIs (for author_badge_id enrichment)
// --------------------
export async function fetchBadgeById(badgeId, token) {
	const ax = getAxios(token);
	try {
		const { data } = await ax.get(`/badges/${badgeId}`);
		return data;
	} catch (_) {
		try {
			const { data } = await ax.get(`/badges`, { params: { id: badgeId } });
			return Array.isArray(data) ? data[0] : data;
		} catch (e) {
			return null;
		}
	}
}
