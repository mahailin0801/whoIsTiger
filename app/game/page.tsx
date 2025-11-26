"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Toast, Button } from "antd-mobile";
import PlayerCard from "@/components/PlayerCard";
import GameHeader from "@/components/GameHeader";
import HostControlPanel from "@/components/HostControlPanel";
import RoleModal from "@/components/RoleModal";
import VoteModal from "@/components/VoteModal";
import VoteResultModal from "@/components/VoteResultModal";
import {
  backgroundImages,
  HOST_ID,
  HOST_NAME,
  generateUniqueId,
} from "@/lib/constants";
import { Player, GameStatus, GameSettings } from "@/lib/types";
import styles from "./Game.module.css";

const isHostPlayer = (player: Player | null) => {
  return player?.role === "host" || player?.id === HOST_ID;
};

export default function GamePage() {
  const router = useRouter();
  const [playerInfo, setPlayerInfo] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [realPlayers, setRealPlayers] = useState<Player[]>([]); // 单独存储真实玩家列表
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [currentPlayerGameRole, setCurrentPlayerGameRole] = useState<
    "civilian" | "undercover" | "blank" | null
  >(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalConfirmed, setRoleModalConfirmed] = useState(false);
  const [isPlayerRemoved, setIsPlayerRemoved] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showVoteResult, setShowVoteResult] = useState(false);
  const [voteResult, setVoteResult] = useState<{
    topPlayers: Array<{ id: string; name: string; votes: number }>;
    isTie: boolean;
  } | null>(null);
  const [eliminationProcessed, setEliminationProcessed] = useState(false);
  const [currentPlayerEliminated, setCurrentPlayerEliminated] = useState(false);
  const [voteRoundActive, setVoteRoundActive] = useState(false);

  // 随机选择一张背景图（只在客户端生成，避免 SSR 不匹配）
  const [randomBackground, setRandomBackground] = useState<string>("");

  useEffect(() => {
    // 只在客户端设置随机背景图
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setRandomBackground(backgroundImages[randomIndex]);
  }, []);

  // 生成mock玩家
  const generateMockPlayers = useCallback(() => {
    const mockNames = [
      "玩家1",
      "玩家2",
      "玩家3",
      "玩家4",
      "玩家5",
      "玩家6",
      "玩家7",
      "玩家8",
    ];
    const baseTimestamp = 1700000000000;
    return mockNames.map((name, index) => ({
      id: `mock-${baseTimestamp + index * 1000}-${name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        .toString(36)}`,
      name,
      role: "player" as const,
      createdAt: new Date(baseTimestamp + index * 1000).toISOString(),
      isReal: false,
    }));
  }, []);

  // 合并真实玩家和假玩家
  // 逻辑：始终显示8个虚拟玩家，当有真实玩家进入时，用真实玩家替换虚拟玩家，并减少虚拟玩家总数
  const mergePlayers = useCallback(
    (realPlayers: Player[], mockPlayers: Player[]) => {
      const merged: Player[] = [];
      const maxPlayers = 12;
      const realCount = realPlayers.length;

      // 计算需要显示的虚拟玩家数量
      // 如果有真实玩家，虚拟玩家数量 = 8 - 真实玩家数量（但不能小于0）
      const mockCount = Math.max(0, 8 - realCount);

      // 先添加真实玩家
      realPlayers.forEach((player) => {
        if (merged.length < maxPlayers) {
          merged.push({ ...player, isReal: true });
        }
      });

      // 然后添加虚拟玩家（只添加需要的数量）
      for (let i = 0; i < mockCount && merged.length < maxPlayers; i++) {
        merged.push(mockPlayers[i]);
      }

      // 如果真实玩家超过8个，继续添加（最多12个）
      if (realCount > 8) {
        for (let i = 8; i < realCount && merged.length < maxPlayers; i++) {
          merged.push({ ...realPlayers[i], isReal: true });
        }
      }

      return merged;
    },
    []
  );

  // 加载玩家信息
  useEffect(() => {
    const playerInfoStr = sessionStorage.getItem("playerInfo");
    if (!playerInfoStr) {
      router.push("/entry");
      return;
    }

    try {
      const info = JSON.parse(playerInfoStr);
      setPlayerInfo(info);
    } catch (error) {
      router.push("/entry");
    }
  }, [router]);

  // 轮询获取游戏数据
  useEffect(() => {
    if (!playerInfo) return;

    const fetchGameData = async () => {
      try {
        // 获取玩家列表
        const playersRes = await fetch("/api/players");
        const playersData = await playersRes.json();
        if (playersData.success) {
          const allRealPlayers = (playersData.data || []).filter(
            (p: Player) => !isHostPlayer(p)
          );
          // 保存真实玩家列表（用于投票弹窗）
          setRealPlayers(allRealPlayers);
          // 合并真实玩家和虚拟玩家（用于显示）
          const mockPlayers = generateMockPlayers();
          const merged = mergePlayers(allRealPlayers, mockPlayers);
          setPlayers(merged);
        }

        // 获取游戏状态
        const statusRes = await fetch("/api/game-status");
        const statusData = await statusRes.json();
        if (statusData.success) {
          setGameStarted(statusData.data.status === "playing");
          setCountdown(statusData.data.countdown);
          setVoteRoundActive(statusData.data.voteRoundActive || false);
        }

        // 获取游戏设置
        const settingsRes = await fetch("/api/game-settings");
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          setGameSettings(settingsData.data);
        }

        // 检查当前玩家是否还在列表中（排除主持人）
        if (playerInfo && playersData.success && !isHostPlayer(playerInfo)) {
          const currentPlayer = playersData.data.find(
            (p: Player) => p.id === playerInfo.id
          );
          if (!currentPlayer) {
            // 玩家已被删除
            setIsPlayerRemoved(true);
            return;
          } else {
            setIsPlayerRemoved(false);
            // 检查当前玩家是否被淘汰
            setCurrentPlayerEliminated(
              currentPlayer.isEliminated === true ||
                currentPlayer.isEliminated === 1
            );
          }

          // 检查当前玩家的角色（只有在未确认过的情况下才显示）
          if (currentPlayer?.gameRole && gameStarted && !roleModalConfirmed) {
            // 如果角色发生了变化，或者弹窗未显示，则显示弹窗
            if (
              currentPlayer.gameRole !== currentPlayerGameRole ||
              !showRoleModal
            ) {
              setCurrentPlayerGameRole(currentPlayer.gameRole);
              setShowRoleModal(true);
            }
          }
        }

        // 检查投票结果（游戏开始后，所有玩家包括主持人都可以看到）
        if (gameStarted && playerInfo) {
          try {
            const voteResultRes = await fetch("/api/votes/result");
            const voteResultData = await voteResultRes.json();
            if (voteResultData.success && voteResultData.data) {
              const { allVoted, topPlayers, isTie } = voteResultData.data;
              console.log('-=-=-=topPlayers=-=-=-=', topPlayers);
              // 只有当所有玩家都已投票且有得票最多的玩家（得票数 > 0）时才显示结果
              // 或者如果已经有投票结果，也要继续显示（即使 allVoted 变为 false，因为玩家被淘汰了）
              const hasValidResult =
                allVoted && topPlayers.length > 0 && topPlayers[0].votes > 0;
              const hasExistingResult =
                voteResult && topPlayers.length > 0 && topPlayers[0].votes > 0;

                console.log('-=-=-=hasValidResult=-=-=-=', hasValidResult);
                console.log('-=-=-=hasExistingResult=-=-=-=', hasExistingResult);
              if (hasValidResult || hasExistingResult) {
                // 检查是否需要更新投票结果（如果结果已变化或还未显示）
                const currentTopPlayerId = voteResult?.topPlayers[0]?.id;
                const newTopPlayerId = topPlayers[0]?.id;
                // 对于主持人和被淘汰的玩家，如果 voteResult 为 null，应该设置
                const shouldShow =
                  !voteResult ||
                  !showVoteResult ||
                  currentTopPlayerId !== newTopPlayerId;
                console.log('-=-=-=shouldShow=-=-=-=', shouldShow);
                if (shouldShow) {
                  setVoteResult({ topPlayers, isTie });
                  setShowVoteResult(true);

                  // 如果不是平票，淘汰得票最多的玩家（只执行一次，避免重复淘汰）
                  // 只有非主持人才能执行淘汰操作（主持人只是查看结果）
                  if (
                    !isTie &&
                    topPlayers[0] &&
                    !eliminationProcessed &&
                    !isHostPlayer(playerInfo)
                  ) {
                    setEliminationProcessed(true);
                    // 更新玩家状态为已淘汰
                    try {
                      const eliminateRes = await fetch(
                        `/api/players/${topPlayers[0].id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isEliminated: true }),
                        }
                      );
                      if (!eliminateRes.ok) {
                        setEliminationProcessed(false); // 如果失败，重置状态以便重试
                      }
                    } catch (error) {
                      setEliminationProcessed(false); // 如果失败，重置状态以便重试
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error("获取投票结果失败:", error);
          }
        }
      } catch (error) {
        console.error("获取游戏数据失败:", error);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 2000); // 每2秒轮询一次

    return () => clearInterval(interval);
  }, [
    playerInfo,
    generateMockPlayers,
    mergePlayers,
    gameStarted,
    showRoleModal,
    showVoteResult,
    eliminationProcessed,
  ]);

  // 分配玩家到左右两列
  const { leftPlayers, rightPlayers } = useMemo(() => {
    const left: Player[] = [];
    const right: Player[] = [];
    players.forEach((player, index) => {
      if (index % 2 === 0) {
        left.push(player);
      } else {
        right.push(player);
      }
    });
    return { leftPlayers: left, rightPlayers: right };
  }, [players]);

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleVoteRoundToggle = async (): Promise<void> => {
    try {
      const newVoteRoundActive = !voteRoundActive;
      const response = await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteRoundActive: newVoteRoundActive }),
      });

      const result = await response.json();
      if (result.success) {
        setVoteRoundActive(newVoteRoundActive);
        Toast.show({
          content: newVoteRoundActive ? "投票已开始" : "投票已暂停",
          position: "top",
        });
      } else {
        Toast.show({
          content: result.message || "操作失败",
          position: "top",
        });
      }
    } catch (error) {
      console.error("切换投票轮状态失败:", error);
      Toast.show({
        content: "操作失败，请重试",
        position: "top",
      });
    }
  };

  const handleStartGame = async () => {
    if (!gameSettings) {
      Toast.show({ content: "请先设置游戏", position: "top" });
      return;
    }

    try {
      // 开始倒计时
      let count = 3;
      setCountdown(count);
      await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "preparing", countdown: count }),
      });

      const countdownInterval = setInterval(async () => {
        count--;
        if (count > 0) {
          setCountdown(count);
          await fetch("/api/game-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "preparing", countdown: count }),
          });
        } else {
          clearInterval(countdownInterval);
          setCountdown(null);

          // 分配角色
          const assignRes = await fetch("/api/game/assign-roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              civilianCount: gameSettings.civilianCount,
              undercoverCount: gameSettings.undercoverCount,
              blankCount: gameSettings.blankCount,
            }),
          });

          if (assignRes.ok) {
            // 更新游戏状态为进行中
            await fetch("/api/game-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "playing", countdown: null }),
            });
            setGameStarted(true);
            // 重置角色弹窗相关状态，让所有玩家重新看到身份弹窗
            setRoleModalConfirmed(false);
            setCurrentPlayerGameRole(null);
            setShowRoleModal(false);

            // 立即获取一次玩家数据，确保能及时检测到新分配的角色
            if (playerInfo && !isHostPlayer(playerInfo)) {
              try {
                const playersRes = await fetch("/api/players");
                const playersData = await playersRes.json();
                if (playersData.success) {
                  const currentPlayer = playersData.data.find(
                    (p: Player) => p.id === playerInfo.id
                  );
                  if (currentPlayer?.gameRole) {
                    setCurrentPlayerGameRole(currentPlayer.gameRole);
                    setShowRoleModal(true);
                  }
                }
              } catch (error) {
                console.error("获取玩家数据失败:", error);
              }
            }
          }
        }
      }, 1000);
    } catch (error) {
      console.error("开始游戏失败:", error);
      Toast.show({ content: "开始游戏失败", position: "top" });
    }
  };

  const handleEndGame = async () => {
    try {
      // 清空所有玩家的身份信息
      await fetch("/api/game/assign-roles", { method: "DELETE" });
      // 清空游戏设置
      await fetch("/api/game-settings", { method: "DELETE" });
      // 更新游戏状态
      await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "waiting", countdown: null }),
      });
      setGameStarted(false);
      setCountdown(null);
      // 重置角色弹窗相关状态
      setRoleModalConfirmed(false);
      setCurrentPlayerGameRole(null);
      setShowRoleModal(false);
      setGameSettings(null); // 清空游戏设置状态
      Toast.show({ content: "游戏已结束", position: "top" });
    } catch (error) {
      console.error("结束游戏失败:", error);
      Toast.show({ content: "结束游戏失败", position: "top" });
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/players?id=${playerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        Toast.show({ content: "玩家已删除", position: "top" });
      }
    } catch (error) {
      console.error("删除玩家失败:", error);
      Toast.show({ content: "删除玩家失败", position: "top" });
    }
  };

  const handleReEnter = () => {
    // 清空 sessionStorage 并返回入口页面
    sessionStorage.removeItem("playerInfo");
    router.push("/entry");
  };

  const handleVote = async (selectedPlayerId: string) => {
    if (!playerInfo) return;

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: playerInfo.id,
          targetId: selectedPlayerId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        Toast.show({
          content: "投票成功",
          position: "top",
        });
        setShowVoteModal(false);
      } else {
        Toast.show({
          content: result.message || "投票失败",
          position: "top",
        });
      }
    } catch (error) {
      console.error("投票失败:", error);
      Toast.show({
        content: "投票失败，请重试",
        position: "top",
      });
    }
  };

  const handleVoteResultConfirm = async () => {
    setShowVoteResult(false);
    setEliminationProcessed(false); // 重置淘汰处理状态

    // 如果是平票，清空投票重新开始
    if (voteResult?.isTie) {
      try {
        await fetch("/api/votes", { method: "DELETE" });
        Toast.show({
          content: "请重新投票",
          position: "top",
        });
      } catch (error) {
        console.error("清空投票失败:", error);
      }
    } else {
      // 如果不是平票，清空投票准备下一轮
      try {
        await fetch("/api/votes", { method: "DELETE" });
      } catch (error) {
        console.error("清空投票失败:", error);
      }
    }
  };

  if (!playerInfo) {
    return null;
  }

  const isHost = isHostPlayer(playerInfo);

  // 如果玩家已被删除，显示蒙层
  if (isPlayerRemoved && !isHost) {
    return (
      <div className={styles.gameContainer}>
        <div
          className={styles.gameBackground}
          style={{ backgroundImage: `url(${randomBackground})` }}
        ></div>
        <div className={styles.removedOverlay}>
          <div className={styles.removedContent}>
            <div className={styles.removedTitle}>您已被移出游戏</div>
            <div className={styles.removedMessage}>请重新进入游戏</div>
            <button className={styles.reEnterButton} onClick={handleReEnter}>
              重新进入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      {randomBackground && (
        <div
          className={styles.gameBackground}
          style={{ backgroundImage: `url(${randomBackground})` }}
        ></div>
      )}
      <GameHeader
        isHost={isHost}
        voteRoundActive={voteRoundActive}
        onSettingsClick={handleSettingsClick}
        onVoteRoundToggle={handleVoteRoundToggle}
      />
      <div className={styles.gameContent}>
        <div className={styles.playersContainer}>
          <div className={styles.playersRow}>
            <div className={`${styles.playersColumn} ${styles.playersLeft}`}>
              {leftPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={index}
                  isReal={player.isReal || false}
                  currentPlayerId={playerInfo.id}
                  isHost={isHost}
                  gameStarted={gameStarted}
                  onDelete={handleDeletePlayer}
                />
              ))}
            </div>
            <div className={`${styles.playersColumn} ${styles.playersRight}`}>
              {rightPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={index}
                  isReal={player.isReal || false}
                  currentPlayerId={playerInfo.id}
                  isHost={isHost}
                  gameStarted={gameStarted}
                  onDelete={handleDeletePlayer}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 游戏准备中/进行中提示 */}
        {!gameStarted && !countdown && (
          <div className={styles.gamePreparing}>
            <div className={styles.preparingTextWrapper}>
              <p className={styles.preparingText}>游戏准备中...</p>
            </div>
          </div>
        )}

        {gameStarted && !countdown && !showVoteResult && (
          <div className={styles.gamePreparing}>
            <div className={styles.preparingTextWrapper}>
              <p className={styles.preparingText}>游戏进行中</p>
            </div>
          </div>
        )}

        {/* 投票结束提示 */}
        {showVoteResult && (
          <div className={styles.gamePreparing}>
            <div className={styles.preparingTextWrapper}>
              <p className={styles.preparingText}>投票结束</p>
            </div>
          </div>
        )}

        {/* 倒计时 */}
        {countdown && (
          <div className={styles.gameCountdown}>
            <div className={styles.countdownTextWrapper}>
              <p className={styles.countdownText}>{countdown}</p>
            </div>
          </div>
        )}
      </div>

      {/* 主持人控制面板 */}
      {isHost && (
        <HostControlPanel
          civilianCount={gameSettings?.civilianCount || 0}
          undercoverCount={gameSettings?.undercoverCount || 0}
          blankCount={gameSettings?.blankCount || 0}
          onStartGame={handleStartGame}
          gameStarted={gameStarted}
          onEndGame={handleEndGame}
        />
      )}

      {/* 角色弹窗 */}
      <RoleModal
        role={currentPlayerGameRole}
        visible={showRoleModal}
        onConfirm={() => {
          setShowRoleModal(false);
          setRoleModalConfirmed(true);
        }}
        civilianWord={gameSettings?.civilianWord}
        undercoverWord={gameSettings?.undercoverWord}
      />

      {/* 投票按钮（游戏开始后，投票轮激活，非主持人、未被淘汰的玩家显示） */}
      {gameStarted &&
        voteRoundActive &&
        !isHost &&
        !countdown &&
        !currentPlayerEliminated && (
          <div className={styles.voteButtonContainer}>
            <Button
              color="primary"
              size="large"
              onClick={() => setShowVoteModal(true)}
              className={styles.voteButton}
            >
              投票
            </Button>
          </div>
        )}

      {/* 投票弹窗 */}
      <VoteModal
        visible={showVoteModal}
        players={realPlayers.filter((p) => {
          // 只排除主持人和被淘汰的玩家
          return !isHostPlayer(p) && !p.isEliminated;
        })}
        onConfirm={handleVote}
        onCancel={() => setShowVoteModal(false)}
      />

      {/* 投票结果弹窗 */}
      {voteResult && (
        <VoteResultModal
          visible={true}
          topPlayers={voteResult.topPlayers}
          isTie={voteResult.isTie}
          onConfirm={handleVoteResultConfirm}
        />
      )}
    </div>
  );
}
