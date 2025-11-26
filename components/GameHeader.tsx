'use client';

import styles from './GameHeader.module.css';

interface GameHeaderProps {
  isHost: boolean;
  voteRoundActive: boolean;
  onSettingsClick: () => void;
  onVoteRoundToggle: () => void;
}

export default function GameHeader({ 
  isHost, 
  voteRoundActive, 
  onSettingsClick, 
  onVoteRoundToggle 
}: GameHeaderProps) {
  return (
    <div className={styles.gameHeader}>
      {isHost && (
        <>
          <button 
            className={styles.voteRoundButton} 
            onClick={onVoteRoundToggle}
            title={voteRoundActive ? '暂停投票' : '开始投票'}
          >
            {voteRoundActive ? '⏸️' : '▶️'}
          </button>
          <button className={styles.settingsButton} onClick={onSettingsClick}>
            ⚙️
          </button>
        </>
      )}
    </div>
  );
}

