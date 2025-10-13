import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/news/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Search from './pages/Search';       
import NewsDetail from './pages/NewsDetail';
import CategoryNav from './components/news/CategoryNav';
import Explore from './pages/Explore';
import StudyPage from './pages/StudyPage';
import AddWordPage from './pages/AddWordPage';
import CommunityPage from './pages/CommunityPage';
import CommunityWritePage from './pages/CommunityWritePage';
import SchedulePage from './pages/SchedulePage';
import VocabPage from './pages/VocabPage';
import BottomNav from './components/navigation/BottomNav';
import { useNavVisibility } from './components/navigation/NavVisibilityContext';
import Profile from './pages/profile';
import Newsletter from './pages/Newsletter';
import BackendStatusDemo from './components/BackendStatusDemo';
import Login from './pages/Login';
import AdminLetters from './pages/AdminPage/AdminLetters';
import AdminNewsGuide from './pages/AdminPage/AdminNewsGuide';
import AdminNewsDetail from './pages/AdminPage/AdminLetters';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { hide } = useNavVisibility();

  const handleSearch = (query) => {
    navigate(`/search/${query}`); 
  };
  
  const isExplore = location.pathname.startsWith('/explore');
  const isStudy = location.pathname.startsWith('/study');
  const isAddWord = location.pathname.startsWith('/study/words/add');
  const isCommunity = location.pathname.startsWith('/community');
  const isProfile = location.pathname.startsWith('/profile');
  const isNewsletter = location.pathname.startsWith('/newsletter');
  const isLogin = location.pathname.startsWith('/login');
  const hideNewsletterNav = location.pathname.startsWith('/newsletter/subscribe') ||
  
    location.pathname === '/newsletter' ||
    location.pathname.startsWith('/newsletter/econ') ||
    location.pathname.startsWith('/newsletter/companies');

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (isProfile) {
      document.body.classList.add('profile-route');
      htmlEl.classList.add('profile-route');
    } else {
      document.body.classList.remove('profile-route');
      htmlEl.classList.remove('profile-route');
    }
  }, [isProfile]);

  return (
    <>
  {!(isExplore || isStudy || isAddWord || isCommunity || isProfile || isNewsletter || isLogin) && <Header onSearch={handleSearch} />}
  {!(isExplore || isStudy || isAddWord || isCommunity || isProfile || isNewsletter || isLogin) && <CategoryNav />}

      <div className="has-bottom-nav">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/" element={
            (sessionStorage.getItem('guest') === '1' || localStorage.getItem('accessToken'))
              ? <Home />
              : <Navigate to="/login" replace />
          } />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/explore/*" element={<Explore />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/study/words/add" element={<AddWordPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/write" element={<CommunityWritePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/vocab" element={<VocabPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/newsletter/*" element={<Newsletter />} />
          <Route path="/dev/backend-status" element={<BackendStatusDemo />} />
          <Route path="/admin/news-letters/*" element={<AdminLetters />} />
          <Route path="/admin/news-guide" element={<AdminNewsGuide />} />
          <Route path="/admin/news-guide/:id" element={<AdminNewsGuide />} />
          <Route path="/admin/news-detail/:id" element={<AdminNewsDetail />} />
          <Route path="/dev/backend-status" element={<BackendStatusDemo />} />
        </Routes>
      </div>
  {!hide && !isStudy && !hideNewsletterNav && !isLogin && <BottomNav />}
    </>
  );
}

export default App;
