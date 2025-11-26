'use client';

import { Dialog } from 'antd-mobile';
import { avatarImages } from '@/lib/constants';
import styles from './PlayerCard.module.css';

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    gameRole?: 'civilian' | 'undercover' | 'blank' | null;
    isEliminated?: boolean;
  };
  index: number;
  isReal?: boolean;
  currentPlayerId?: string;
  isHost?: boolean;
  gameStarted?: boolean;
  onDelete?: (playerId: string) => void;
}

export default function PlayerCard({
  player,
  isReal = false,
  currentPlayerId = '',
  isHost = false,
  gameStarted = false,
  onDelete,
}: PlayerCardProps) {
  // 为玩家随机分配头像
  const getRandomAvatar = (playerId: string) => {
    const hash = playerId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % avatarImages.length;
    return avatarImages[index];
  };

  const isCurrentPlayer = player.id === currentPlayerId;
  const displayName =
    player.name && player.name.length > 3
      ? player.name.substring(0, 3) + '...'
      : player.name;

  const isEliminated = player.isEliminated || false;

  const getRoleText = (role?: string | null) => {
    if (role === 'civilian') return '平民';
    if (role === 'undercover') return '卧底';
    if (role === 'blank') return '空白';
    return '';
  };

  const roleText = getRoleText(player.gameRole);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && player.id && !player.id.startsWith('mock-')) {
      Dialog.confirm({
        content: `确定要删除玩家 "${player.name}" 吗？`,
        confirmText: '删除',
        cancelText: '取消',
        onConfirm: () => {
          onDelete(player.id);
        },
      });
    }
  };

  const showDeleteButton =
    isHost &&
    !gameStarted &&
    isReal &&
    player.id &&
    !player.id.startsWith('mock-');

  return (
    <div className={styles.playerCard}>
      <div className={styles.playerAvatarWrapper}>
        <img
          src={getRandomAvatar(player.id || player.name)}
          alt={player.name}
          className={`${styles.playerAvatar} ${
            isReal ? styles.playerAvatarHighlight : ''
          } ${isCurrentPlayer ? styles.playerAvatarReal : ''} ${
            isEliminated ? styles.playerAvatarEliminated : ''
          }`}
        />
        {isEliminated && (
          <>
            <div className={styles.playerAvatarOverlay}></div>
            <div className={styles.playerOutBadge}>OUT</div>
            {roleText && <div className={styles.playerRoleText}>{roleText}</div>}
          </>
        )}
        {/* 游戏开始后，只有主持人可以看到所有玩家身份，普通玩家只能看到自己的身份 */}
        {!isEliminated && isReal && gameStarted && roleText && (isHost || isCurrentPlayer) && (
          <div className={styles.playerRoleBadge}>{roleText}</div>
        )}
        {showDeleteButton && (
          <button
            className={styles.playerDeleteButton}
            onClick={handleDelete}
            aria-label="删除玩家"
          >
            ×
          </button>
        )}
      </div>
      <p className={styles.playerName} title={player.name}>
        {displayName}
      </p>
    </div>
  );
}

