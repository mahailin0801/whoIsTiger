"use client";

import { avatarImages } from "@/lib/constants";
import styles from "./VoteResultModal.module.css";

interface VoteResultModalProps {
  visible: boolean;
  topPlayers: Array<{ id: string; name: string; votes: number }>;
  isTie: boolean;
  onConfirm: () => void;
}

export default function VoteResultModal({
  visible,
  topPlayers,
  isTie,
  onConfirm,
}: VoteResultModalProps) {
  // 为玩家随机分配头像
  const getRandomAvatar = (playerId: string) => {
    const hash = playerId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % avatarImages.length;
    return avatarImages[index];
  };

  if (!visible) return null;

  return (
    <div className={styles.voteResultOverlay} onClick={onConfirm}>
      <div
        className={styles.voteResultContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.voteResultContent}>
          <div className={styles.voteResultTitle}>
            {isTie ? "平票！" : "投票结果"}
          </div>
          {isTie ? (
            <>
              <div className={styles.tieMessage}>
                以下玩家得票相同，请重新投票
              </div>
              <div className={styles.playersList}>
                {topPlayers.map((player) => (
                  <div key={player.id} className={styles.playerItem}>
                    <div className={styles.playerAvatarWrapper}>
                      <img
                        src={getRandomAvatar(player.id)}
                        alt={player.name}
                        className={styles.playerAvatar}
                      />
                      <div className={styles.playerNameOverlay}>
                        {player.name.length > 3
                          ? player.name.substring(0, 3) + "..."
                          : player.name}
                      </div>
                    </div>
                    <div className={styles.playerVotes}>
                      得票: {player.votes}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.eliminatedMessage}>
                {topPlayers[0]?.name || "未知玩家"} 被淘汰
              </div>
              {topPlayers[0] && (
                <div className={styles.eliminatedPlayer}>
                  <div className={styles.playerAvatarWrapper}>
                    <img
                      src={getRandomAvatar(topPlayers[0].id)}
                      alt={topPlayers[0].name}
                      className={styles.playerAvatar}
                    />
                    <div className={styles.playerNameOverlay}>
                      {topPlayers[0].name.length > 3
                        ? topPlayers[0].name.substring(0, 3) + "..."
                        : topPlayers[0].name}
                    </div>
                  </div>
                  <div className={styles.playerVotes}>
                    得票: {topPlayers[0].votes}
                  </div>
                </div>
              )}
            </>
          )}
          <button className={styles.confirmButton} onClick={onConfirm}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
