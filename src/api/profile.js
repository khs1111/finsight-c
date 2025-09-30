
import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api';

// Axios instance with JWT token 지원
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
// 프로필/대시보드 관련 API
// --------------------

// 대시보드(학습 현황, 출석, 티어, 벳지 등) 조회
export function fetchDashboard(userId, token) {
	return getAxios(token).get('/dashboard', {
		params: { userId }
	});
}

// 벳지 조회
export function fetchBadges(userId, token) {
	return getAxios(token).get(`/badges/user/${userId}`);
}

// 출석(스트릭) 정보는 대시보드 응답에 포함됨

// --------------------
// 기존 함수(백엔드 문서에 없음, 필요시 확장)
// --------------------
// export const fetchProfile = () => axios.get('/api/user/profile');
// export const updateProfile = (data) => axios.put('/api/user/profile', data);
// export const fetchProfileActivity = () => axios.get('/api/user/activity');
// export const fetchProfileStats = () => axios.get('/api/user/stats');

// 기존 함수(백엔드 문서에 없음, 필요시 확장)
export const fetchProfile = () => axios.get('/api/user/profile');
export const fetchProfileActivity = () => axios.get('/api/user/activity');
