import React from 'react';
import { useAppStore } from '../../state/store';

export const Home: React.FC = () => {
  const { recentBriefs, pinnedBriefs, searchBriefs, setCurrentBrief, setActiveView } = useAppStore();

  const handleBriefClick = (brief: any) => {
    setCurrentBrief(brief);
    setActiveView('result');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-white font-medium text-sm">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="glass-button p-3 text-left">
            <div className="text-white text-sm font-medium">Voice Ask</div>
            <div className="text-white/60 text-xs">Ctrl+Shift+V</div>
          </button>
          <button className="glass-button p-3 text-left">
            <div className="text-white text-sm font-medium">Highlight</div>
            <div className="text-white/60 text-xs">Ctrl+Shift+/</div>
          </button>
        </div>
      </div>

      {/* Pinned Briefs */}
      {pinnedBriefs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm flex items-center">
            📌 Pinned
          </h3>
          <div className="space-y-2">
            {pinnedBriefs.slice(0, 3).map((brief) => (
              <div
                key={brief.id}
                onClick={() => handleBriefClick(brief)}
                className="glass-button p-3 cursor-pointer hover:bg-white/15 transition-colors"
              >
                <div className="text-white text-sm font-medium truncate">
                  {brief.title}
                </div>
                <div className="text-white/60 text-xs mt-1 line-clamp-2">
                  {brief.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Briefs */}
      <div className="space-y-3">
        <h3 className="text-white font-medium text-sm">Recent</h3>
        {recentBriefs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/60 text-sm">
              No recent briefs yet
            </div>
            <div className="text-white/40 text-xs mt-2">
              Press Ctrl+Shift+V to ask a question
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {recentBriefs.slice(0, 5).map((brief) => (
              <div
                key={brief.id}
                onClick={() => handleBriefClick(brief)}
                className="glass-button p-3 cursor-pointer hover:bg-white/15 transition-colors"
              >
                <div className="text-white text-sm font-medium truncate">
                  {brief.title}
                </div>
                <div className="text-white/60 text-xs mt-1 line-clamp-2">
                  {brief.summary}
                </div>
                <div className="text-white/40 text-xs mt-2">
                  {new Date(brief.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};