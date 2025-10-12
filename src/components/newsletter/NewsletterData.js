import nvidiaImage from '../../assets/newsletter/nvidia.png';
import usStockImage from '../../assets/newsletter/usa.png';
import realEstateImage from '../../assets/newsletter/real-estate.png';
import letterBook from '../../assets/newsletter/letter-book.png';

const newsData = [
  {
    id: 1,
    category: '테크',
    title: '엔비디아 천하? AI 반도체 전쟁,\n 승자는 누구인가?',
    subtitle: 'AI 시장의 폭발적 성장과 함께 ‘황금알 낳는 거위’로 떠오른 AI 반도체. 엔비디아가 GPU로 압도적인 독주, 그 뒤를 잇는 추격자들',
    date: '2025/10/7',
    imageUrl: nvidiaImage,
    url: 'https://stib.ee/2MfJ',
  },
  {
    id: 2,
    category: '미국 증시',
    title: '금리 인하 기대감 vs 인플레이션 압박',
    subtitle: '일반적으로 금리 인하는 시장에 활력을 불어넣는 긍정적인 신호로 여겨집니다. 그렇다면 Fed는 왜 이런 결정을 내렸을까요?',
    date: '2025/10/7',
    imageUrl: usStockImage,
    url: 'https://stib.ee/4MfJ',
  },
  {
    id: 3,
    category: '부동산',
    title: '부동산 빙하기 끝?\n 지금 사야 할까 팔아야 할까?',
    subtitle: '요즘 뉴스 보면 "부동산 시장이 다시 살아난다", "빙하기가 끝났다" 이런 말들이 많이 들리죠? 지난 몇 달 사이 분위기가 조금 달라진 건 사실이에요.',
    date: '2025/10/6',
    imageUrl: realEstateImage,
    url: 'https://stib.ee/6MfJ',
  },
  {
    id: 4,
    tags: ['#해외 경제', '#미국 증시', '#테크', '#삼성'],
    title: '2025.10월 둘째 주 뉴스레터 쿠키',
    date: '2025/10/6 - 10/12',
    imageUrl: letterBook,
    url: 'https://stib.ee/8MfJ'
  }
];

export default newsData;