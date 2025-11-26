"use client";

import styles from "./GameStatusOverlay.module.scss";

interface GameStatusOverlayProps {
  // 游戏准备中
  isPreparing?: boolean;
  // 游戏进行中
  isPlaying?: boolean;
  // 投票结束
  isVoteEnded?: boolean;
  // 倒计时数字
  countdown?: number | null;
}

export default function GameStatusOverlay({
  isPreparing = false,
  isPlaying = false,
  isVoteEnded = false,
  countdown = null,
}: GameStatusOverlayProps) {
  // 如果显示倒计时，优先显示倒计时
  if (countdown !== null && countdown > 0) {
    return (
      <div className={styles.gameCountdown}>
        <div className={styles.countdownTextWrapper}>
          <p className={styles.countdownText}>{countdown}</p>
        </div>
      </div>
    );
  }

  // 投票结束提示
  if (isVoteEnded) {
    return (
      <div className={styles.gamePreparing}>
        <div className={styles.preparingTextWrapper}>
          <p className={styles.preparingText}>投票结束</p>
        </div>
      </div>
    );
  }

  // 游戏进行中提示
  if (isPlaying) {
    return (
      <div className={styles.gamePreparing}>
        <div className={styles.preparingTextWrapper}>
          <p className={styles.preparingText}>游戏进行中</p>
        </div>
      </div>
    );
  }

  // 游戏准备中提示
  if (isPreparing) {
    return (
      <div className={styles.gamePreparing}>
        <div className={styles.preparingTextWrapper}>
          <p className={styles.preparingText}>游戏准备中...</p>
        </div>
      </div>
    );
  }

  return null;
}

