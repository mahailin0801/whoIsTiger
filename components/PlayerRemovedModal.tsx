"use client";

import styles from "./PlayerRemovedModal.module.scss";

interface PlayerRemovedModalProps {
  visible: boolean;
  onReEnter: () => void;
}

export default function PlayerRemovedModal({
  visible,
  onReEnter,
}: PlayerRemovedModalProps) {
  if (!visible) return null;

  return (
    <div className={styles.removedOverlay}>
      <div className={styles.removedContent}>
        <div className={styles.removedTitle}>您已被移出游戏</div>
        <div className={styles.removedMessage}>请重新进入游戏</div>
        <button className={styles.reEnterButton} onClick={onReEnter}>
          重新进入
        </button>
      </div>
    </div>
  );
}

