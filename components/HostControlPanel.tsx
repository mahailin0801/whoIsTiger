"use client";

import { Button } from "antd-mobile";
import styles from "./HostControlPanel.module.css";

interface HostControlPanelProps {
  civilianCount: number;
  undercoverCount: number;
  blankCount: number;
  onStartGame: () => void;
  gameStarted: boolean;
  onEndGame: () => void;
}

export default function HostControlPanel({
  civilianCount,
  undercoverCount,
  blankCount,
  onStartGame,
  gameStarted,
  onEndGame,
}: HostControlPanelProps) {
  return (
    <div
      className={styles.hostControlPanel}
      style={{
        background: gameStarted ? "transparent" : "rgba(98, 161, 152, 0.5)",
      }}
    >
      {!gameStarted && (
        <>
          <div className={styles.hostRoleInfo}>
            <div className={styles.roleItem}>
              <span className={styles.roleLabel}>平民</span>
              <span className={styles.roleCount}>{civilianCount}</span>
            </div>
            <div className={styles.roleItem}>
              <span className={styles.roleLabel}>卧底</span>
              <span className={styles.roleCount}>{undercoverCount}</span>
            </div>
            <div className={styles.roleItem}>
              <span className={styles.roleLabel}>空白卡</span>
              <span className={styles.roleCount}>{blankCount}</span>
            </div>
          </div>
          <Button
            color="primary"
            size="large"
            block
            onClick={onStartGame}
            className={styles.startGameButton}
          >
            游戏开始
          </Button>
        </>
      )}
      {gameStarted && (
        <Button
          color="danger"
          size="large"
          block
          onClick={onEndGame}
          className={styles.endGameButton}
        >
          结束游戏
        </Button>
      )}
    </div>
  );
}
