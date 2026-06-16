import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components";
import Home from "@/pages/Home";
import GameLandingPage from "@/pages/GameLandingPage";
import GamePlayPage from "@/pages/GamePlayPage";
import GameResultPage from "@/pages/GameResultPage";
import WorkshopPage from "@/pages/WorkshopPage";
import WorkshopEditorPage from "@/pages/WorkshopEditorPage";
import SignLanguagePage from "@/pages/SignLanguagePage";
import SignLanguageLearnPage from "@/pages/SignLanguageLearnPage";
import CommunityPage from "@/pages/CommunityPage";
import ChartDetailPage from "@/pages/ChartDetailPage";
import UserProfilePage from "@/pages/UserProfilePage";
import UserSettingsPage from "@/pages/UserSettingsPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-deep-ocean">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<GameLandingPage />} />
          <Route path="/game/play" element={<GamePlayPage />} />
          <Route path="/game/play/:id" element={<GamePlayPage />} />
          <Route path="/game/result" element={<GameResultPage />} />
          <Route path="/workshop" element={<WorkshopPage />} />
          <Route path="/workshop/editor/new" element={<WorkshopEditorPage />} />
          <Route path="/workshop/editor/:id" element={<WorkshopEditorPage />} />
          <Route path="/signlanguage" element={<SignLanguagePage />} />
          <Route path="/signlanguage/learn" element={<SignLanguageLearnPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/chart/:id" element={<ChartDetailPage />} />
          <Route path="/user" element={<UserProfilePage />} />
          <Route path="/user/settings" element={<UserSettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}
