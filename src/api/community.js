import axios from 'axios';
import { API_BASE as BASE_URL } from './config';

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
	});
export const createCommunityPost = (data, token) => getAxios(token).post('/community/posts', data);
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

// 오답 노트 목록 조회 (supports pagination & filtering)
export function fetchWrongNotes({ userId, page = 0, size = 20, filter = 'all', token }) {
	return getAxios(token).get(`/wrong-notes`, {
		params: { userId, page, size, filter }
	});
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
	const payload = {
		userId,
		quizId,
		questionId,
		selectedOptionId,
		correctOptionId,
		category,
		meta,
	};
	return getAxios(token).post(`/wrong-notes`, payload);
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
