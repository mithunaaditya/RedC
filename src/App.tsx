  import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
  import Layout from './components/Layout';
  import HomePage from './pages/HomePage';
  import ProfilePage from './pages/ProfilePage';
  import ComPage from './pages/CommunityPage';
  import SubmitPage from './pages/SubmitPage';
  import PostPage from './pages/PostPage';

  function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="u/:username" element={<ProfilePage />} />
          <Route path="c/:communityName" element={<ComPage />} />
          <Route path="c/:communityName/submit" element={<SubmitPage />} />
          <Route path="post/:postId" element={<PostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App