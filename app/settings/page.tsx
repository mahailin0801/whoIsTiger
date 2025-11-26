'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Toast } from 'antd-mobile';
import { backgroundImages, HOST_ID } from '@/lib/constants';
import { Player, GameSettings } from '@/lib/types';
import styles from './Settings.module.scss';

const isHostPlayer = (player: Player | null) => {
  return player?.role === 'host' || player?.id === HOST_ID;
};

export default function SettingsPage() {
  const router = useRouter();
  const [civilianWord, setCivilianWord] = useState('');
  const [undercoverWord, setUndercoverWord] = useState('');
  const [civilianCount, setCivilianCount] = useState(0);
  const [undercoverCount, setUndercoverCount] = useState(0);
  const [blankCount, setBlankCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // 随机选择一张背景图（只在客户端生成，避免 SSR 不匹配）
  const [randomBackground, setRandomBackground] = useState<string>('');
  
  useEffect(() => {
    // 只在客户端设置随机背景图
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setRandomBackground(backgroundImages[randomIndex]);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取真实玩家数量（排除主持人）
        const playersRes = await fetch('/api/players');
        const playersData = await playersRes.json();
        if (playersData.success) {
          const realPlayers = (playersData.data || []).filter((p: Player) => !isHostPlayer(p));
          setTotalPlayers(realPlayers.length);
        }

        // 读取游戏设置
        const settingsRes = await fetch('/api/game-settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          setCivilianWord(settingsData.data.civilianWord || '');
          setUndercoverWord(settingsData.data.undercoverWord || '');
          setCivilianCount(settingsData.data.civilianCount || 0);
          setUndercoverCount(settingsData.data.undercoverCount || 0);
          setBlankCount(settingsData.data.blankCount || 0);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    loadData();
  }, []);

  const totalCount = civilianCount + undercoverCount + blankCount;

  const validateCounts = () => {
    if (totalCount > totalPlayers) {
      Toast.show({
        content: `总数量不能超过真实玩家总数（${totalPlayers}人）`,
        position: 'top',
      });
      return false;
    }
    if (civilianCount < 0 || undercoverCount < 0 || blankCount < 0) {
      Toast.show({
        content: '数量不能为负数',
        position: 'top',
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateCounts()) {
      return;
    }

    try {
      const response = await fetch('/api/game-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          civilianWord: civilianWord.trim(),
          undercoverWord: undercoverWord.trim(),
          civilianCount: Number(civilianCount) || 0,
          undercoverCount: Number(undercoverCount) || 0,
          blankCount: Number(blankCount) || 0,
        }),
      });

      const result = await response.json();
      if (result.success) {
        Toast.show({
          content: '设置已保存',
          position: 'top',
        });
        router.push('/game');
      } else {
        Toast.show({
          content: result.message || '保存失败',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      Toast.show({
        content: '保存设置失败',
        position: 'top',
      });
    }
  };

  const handleBack = () => {
    router.push('/game');
  };

  return (
    <div className={styles.settingsContainer}>
      {randomBackground && (
        <div
          className={styles.settingsBackground}
          style={{ backgroundImage: `url(${randomBackground})` }}
        ></div>
      )}
      <div className={styles.settingsHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          ← 返回
        </button>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingsTotalInfo}>
          <span className={styles.totalText}>总人数: {totalPlayers} 人</span>
          <span className={styles.countText}>
            已分配: {totalCount} / {totalPlayers}
          </span>
          {totalCount > totalPlayers && (
            <span className={styles.countError}>超出限制！</span>
          )}
        </div>

        <div className={styles.settingsForm}>
          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>平民词语</label>
            <Input
              value={civilianWord}
              onChange={(val) => setCivilianWord(val)}
              placeholder="请输入平民词语"
              className={styles.settingsInput}
              clearable
            />
          </div>

          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>卧底词语</label>
            <Input
              value={undercoverWord}
              onChange={(val) => setUndercoverWord(val)}
              placeholder="请输入卧底词语"
              className={styles.settingsInput}
              clearable
            />
          </div>

          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>平民数量</label>
            <Input
              value={String(civilianCount)}
              onChange={(val) => {
                const num = val === '' ? 0 : parseInt(val) || 0;
                setCivilianCount(Math.max(0, num));
              }}
              placeholder="0"
              className={styles.settingsInput}
              type="number"
            />
          </div>

          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>卧底数量</label>
            <Input
              value={String(undercoverCount)}
              onChange={(val) => {
                const num = val === '' ? 0 : parseInt(val) || 0;
                setUndercoverCount(Math.max(0, num));
              }}
              placeholder="0"
              className={styles.settingsInput}
              type="number"
            />
          </div>

          <div className={styles.settingsItem}>
            <label className={styles.settingsItemLabel}>空白卡数量</label>
            <Input
              value={String(blankCount)}
              onChange={(val) => {
                const num = val === '' ? 0 : parseInt(val) || 0;
                setBlankCount(Math.max(0, num));
              }}
              placeholder="0"
              className={styles.settingsInput}
              type="number"
            />
          </div>
        </div>

        <div className={styles.settingsActions}>
          <Button
            color="primary"
            size="large"
            block
            onClick={handleSave}
            className={styles.confirmButton}
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  );
}

