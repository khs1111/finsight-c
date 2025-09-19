import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/news/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
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
  const hideNewsletterNav = location.pathname.startsWith('/newsletter/subscribe') ||
    location.pathname === '/newsletter' ||
    location.pathname.startsWith('/newsletter/econ') ||
    location.pathname.startsWith('/newsletter/tech') ||
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
  {!(isExplore || isStudy || isAddWord || isCommunity || isProfile || isNewsletter) && <Header onSearch={handleSearch} />}
  {!(isExplore || isStudy || isAddWord || isCommunity || isProfile || isNewsletter) && <CategoryNav />}

      <div className="has-bottom-nav">
        <Routes>
          <Route path="/" element={<Home />} />
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
        </Routes>
      </div>
  {!hide && !isStudy && !hideNewsletterNav && <BottomNav />}
    </>
  );
}

export default App;
