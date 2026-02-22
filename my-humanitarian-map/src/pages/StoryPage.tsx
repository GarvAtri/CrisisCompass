import { AnalyticsDashboard } from '../components/AnalyticsDashboard.tsx';

interface StoryPageProps {
  onBack: () => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ onBack }) => {
  return <AnalyticsDashboard onBack={onBack} />;
};