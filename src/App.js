// App.js
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/news/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import NewsDetail from './pages/NewsDetail';
import CategoryNav from './components/news/CategoryNav';
import Explore from './pages/Explore';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (query) => {
    navigate(`/search/${query}`); 
  };

  const isExplore = location.pathname.startsWith("/explore");

  return (
    <>
      {!isExplore && <Header onSearch={handleSearch} />} 
      {!isExplore && <CategoryNav />}  

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/explore/*" element={<Explore />} />
      </Routes>
    </>
  );
}

export default App;
