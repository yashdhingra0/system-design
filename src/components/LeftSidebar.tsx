import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_GROUPS } from './TopNavbar';
import type { Tab } from './TopNavbar';

interface LeftSidebarProps {
  currentTab: Tab;
  activeGroupLabel: string | null;
  onSelectTab: (tab: Tab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab, activeGroupLabel, onSelectTab, collapsed, onToggleCollapse,
}) => {
  // Derive active group: explicit selection OR group containing current tab
  const activeGroup = NAV_GROUPS.find(g => g.label === activeGroupLabel)
    || NAV_GROUPS.find(g => g.items.some(i => i.tab === currentTab));

  return (
    <>
      {/* Sidebar panel */}
      <aside className={`left-sidebar${collapsed ? ' collapsed' : ''}`}>
        {/* Group label header */}
        {activeGroup && (
          <div style={{
            padding: '16px 16px 8px',
            borderBottom: '1px solid var(--border-sidebar)',
            marginBottom: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {activeGroup.emoji} {activeGroup.label}
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '4px 0' }}>
          {activeGroup?.items.map(item => (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`left-sidebar-item${currentTab === item.tab ? ' active' : ''}`}
            >
              <span style={{ flexShrink: 0, opacity: currentTab === item.tab ? 1 : 0.6 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              {item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 4,
                  background: 'rgba(16,185,129,0.12)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0,
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* All groups mini nav at bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-sidebar)', marginTop: 'auto' }}>
          {NAV_GROUPS.map(group => {
            const isThis = group.label === activeGroup?.label;
            return (
              <button
                key={group.label}
                onClick={() => onSelectTab(group.items[0].tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '6px 8px', borderRadius: 6, border: 'none',
                  background: isThis ? 'rgba(16,185,129,0.08)' : 'transparent',
                  color: isThis ? '#10b981' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: isThis ? 700 : 500, cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isThis) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                onMouseLeave={e => { if (!isThis) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
              >
                <span style={{ fontSize: 14 }}>{group.emoji}</span>
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className="left-sidebar-toggle"
        style={{ left: collapsed ? 0 : 220 }}
        title={collapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </>
  );
};
