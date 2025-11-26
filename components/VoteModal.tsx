'use client';

import { useState } from 'react';
import { Button } from 'antd-mobile';
import { avatarImages } from '@/lib/constants';
import { Player } from '@/lib/types';
import styles from './VoteModal.module.scss';

interface VoteModalProps {
  visible: boolean;
  players: Player[];
  onConfirm: (selectedPlayerId: string) => void;
  onCancel: () => void;
}

export default function VoteModal({
  visible,
  players,
  onConfirm,
  onCancel,
}: VoteModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // 为玩家随机分配头像
  const getRandomAvatar = (playerId: string) => {
    const hash = playerId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % avatarImages.length;
    return avatarImages[index];
  };

  const handleConfirm = () => {
    if (selectedPlayerId) {
      onConfirm(selectedPlayerId);
      setSelectedPlayerId('');
    }
  };

  // 重置选中状态当弹窗关闭时
  if (!visible && selectedPlayerId) {
    setSelectedPlayerId('');
  }

  if (!visible) return null;

  return (
    <div className={styles.voteModalOverlay} onClick={onCancel}>
      <div
        className={styles.voteModalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.voteModalContent}>
          <div className={styles.voteModalTitle}>请选择要投票的玩家</div>
          {players.length === 0 ? (
            <div className={styles.emptyPlayers}>暂无可投票的玩家</div>
          ) : (
            <div className={styles.playersGrid}>
              {players.map((player) => (
              <div
                key={player.id}
                className={`${styles.playerItem} ${
                  selectedPlayerId === player.id ? styles.playerItemSelected : ''
                }`}
                onClick={() => setSelectedPlayerId(player.id)}
              >
                <div className={styles.playerAvatarWrapper}>
                  <img
                    src={getRandomAvatar(player.id)}
                    alt={player.name}
                    className={styles.playerAvatar}
                  />
                  <div className={styles.playerNameOverlay}>
                    {player.name.length > 3
                      ? player.name.substring(0, 3) + '...'
                      : player.name}
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
          <div className={styles.voteModalActions}>
            <Button
              size="large"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              取消
            </Button>
            <Button
              color="primary"
              size="large"
              onClick={handleConfirm}
              disabled={!selectedPlayerId}
              className={styles.confirmButton}
            >
              确定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

