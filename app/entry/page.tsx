"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Toast, Dialog } from "antd-mobile";
import {
  backgroundImages,
  avatarImages,
  HOST_ID,
  HOST_NAME,
  generateUniqueId,
} from "@/lib/constants";
import styles from "./Entry.module.css";

export default function EntryPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const cubeWrapperRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 1, y: 1 });

  // 随机选择一张背景图（只在客户端生成，避免 SSR 不匹配）
  const [randomBackground, setRandomBackground] = useState<string>("");

  useEffect(() => {
    // 只在客户端设置随机背景图
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setRandomBackground(backgroundImages[randomIndex]);
  }, []);

  // 随机选择一张头像图片（只在客户端生成）
  const [randomAvatar, setRandomAvatar] = useState<string>("");

  // 为立方体的6个面随机分配图片（可以重复）
  const [cubeFaceImages, setCubeFaceImages] = useState<string[]>([]);

  useEffect(() => {
    // 只在客户端设置随机头像和立方体图片
    const avatarIndex = Math.floor(Math.random() * avatarImages.length);
    setRandomAvatar(avatarImages[avatarIndex]);

    const faces: string[] = [];
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * avatarImages.length);
      faces.push(avatarImages[randomIndex]);
    }
    setCubeFaceImages(faces);
  }, []);

  // 立方体移动和边界回弹动画
  useEffect(() => {
    // 等待立方体图片加载完成后再启动动画
    if (cubeFaceImages.length === 0) return;

    const cubeWrapper = cubeWrapperRef.current;
    if (!cubeWrapper) return;

    // 立方体尺寸（需要与CSS中的尺寸一致）
    const cubeSize = 80;
    const speed = 1.5; // 移动速度（增加速度）

    // 初始化位置（随机位置，避免总是居中）
    positionRef.current = {
      x: Math.random() * (window.innerWidth - cubeSize),
      y: Math.random() * (window.innerHeight - cubeSize),
    };

    // 初始化速度（随机方向）
    velocityRef.current = {
      x: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
      y: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
    };

    // 设置初始位置
    cubeWrapper.style.left = `${positionRef.current.x}px`;
    cubeWrapper.style.top = `${positionRef.current.y}px`;
    cubeWrapper.style.position = 'absolute';

    let animationId: number;

    const animate = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // 更新位置
      positionRef.current.x += velocityRef.current.x * speed;
      positionRef.current.y += velocityRef.current.y * speed;

      // 边界检测和回弹
      if (positionRef.current.x <= 0) {
        velocityRef.current.x = Math.abs(velocityRef.current.x);
        positionRef.current.x = 0;
      } else if (positionRef.current.x >= containerWidth - cubeSize) {
        velocityRef.current.x = -Math.abs(velocityRef.current.x);
        positionRef.current.x = containerWidth - cubeSize;
      }

      if (positionRef.current.y <= 0) {
        velocityRef.current.y = Math.abs(velocityRef.current.y);
        positionRef.current.y = 0;
      } else if (positionRef.current.y >= containerHeight - cubeSize) {
        velocityRef.current.y = -Math.abs(velocityRef.current.y);
        positionRef.current.y = containerHeight - cubeSize;
      }

      // 应用位置
      cubeWrapper.style.left = `${positionRef.current.x}px`;
      cubeWrapper.style.top = `${positionRef.current.y}px`;

      animationId = requestAnimationFrame(animate);
    };

    // 处理窗口大小变化
    const handleResize = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // 确保立方体在边界内
      positionRef.current.x = Math.max(
        0,
        Math.min(containerWidth - cubeSize, positionRef.current.x)
      );
      positionRef.current.y = Math.max(
        0,
        Math.min(containerHeight - cubeSize, positionRef.current.y)
      );
      
      // 更新位置
      cubeWrapper.style.left = `${positionRef.current.x}px`;
      cubeWrapper.style.top = `${positionRef.current.y}px`;
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [cubeFaceImages.length]); // 依赖立方体图片数组长度

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({
        content: "请输入名称",
        position: "top",
      });
      return;
    }

    const trimmedName = name.trim();
    const isHost = trimmedName === HOST_NAME;

    // 检查名称是否已经输入过（排除主持人）
    if (!isHost) {
      try {
        const response = await fetch("/api/players");
        const result = await response.json();
        if (result.success && result.data) {
          const existingPlayer = result.data.find(
            (p: any) => p.name === trimmedName && p.id !== HOST_ID
          );
          if (existingPlayer) {
            Toast.show({
              content: "该名称已被使用，请使用其他名称",
              position: "top",
            });
            return;
          }
        }
      } catch (error) {
        console.error("检查玩家名称失败:", error);
      }
    }

    // 如果是主持人，使用固定ID；否则生成唯一ID
    const playerId = isHost ? HOST_ID : generateUniqueId();

    // 保存玩家信息到数据库
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: playerId,
          name: trimmedName,
          role: isHost ? "host" : "player",
        }),
      });

      const result = await response.json();
      if (result.success) {
        // 保存到 sessionStorage 用于后续页面识别
        sessionStorage.setItem(
          "playerInfo",
          JSON.stringify({
            id: playerId,
            name: trimmedName,
            role: isHost ? "host" : "player",
          })
        );

        // 跳转到游戏页面
        router.push("/game");
      } else {
        Toast.show({
          content: result.message || "加入游戏失败",
          position: "top",
        });
      }
    } catch (error) {
      console.error("加入游戏失败:", error);
      Toast.show({
        content: "加入游戏失败，请重试",
        position: "top",
      });
    }
  };

  const handleClearData = () => {
    Dialog.confirm({
      content: "确定要清空所有游戏数据吗？这将清除所有玩家信息和游戏状态。",
      confirmText: "确定",
      cancelText: "取消",
      onConfirm: async () => {
        try {
          // 清空本地存储
          sessionStorage.clear();
          localStorage.clear();
          
          // 清空服务器端数据
          const response = await fetch("/api/clear", {
            method: "POST",
          });
          const result = await response.json();
          if (result.success) {
            Toast.show({
              content: "数据已清空，请刷新页面",
              position: "top",
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } catch (error) {
          console.error("清空数据失败:", error);
          Toast.show({
            content: "清空数据失败",
            position: "top",
          });
        }
      },
    });
  };

  return (
    <div className={styles.entryContainer}>
      {randomBackground ? (
        <div
          className={styles.entryBackground}
          style={{ backgroundImage: `url(${randomBackground})` }}
        ></div>
      ) : (
        <div className={styles.entryBackground}></div>
      )}
      {cubeFaceImages.length > 0 && (
        <div className={styles.cubeWrapper} ref={cubeWrapperRef}>
          <div className={styles.cube}>
            <div
              className={`${styles.cubeFace} ${styles.cubeFront}`}
              style={{ backgroundImage: `url(${cubeFaceImages[0]})` }}
            ></div>
            <div
              className={`${styles.cubeFace} ${styles.cubeBack}`}
              style={{ backgroundImage: `url(${cubeFaceImages[1]})` }}
            ></div>
            <div
              className={`${styles.cubeFace} ${styles.cubeRight}`}
              style={{ backgroundImage: `url(${cubeFaceImages[2]})` }}
            ></div>
            <div
              className={`${styles.cubeFace} ${styles.cubeLeft}`}
              style={{ backgroundImage: `url(${cubeFaceImages[3]})` }}
            ></div>
            <div
              className={`${styles.cubeFace} ${styles.cubeTop}`}
              style={{ backgroundImage: `url(${cubeFaceImages[4]})` }}
            ></div>
            <div
              className={`${styles.cubeFace} ${styles.cubeBottom}`}
              style={{ backgroundImage: `url(${cubeFaceImages[5]})` }}
            ></div>
          </div>
        </div>
      )}
      <div className={styles.entryContent}>
        <div className={styles.entryForm}>
          {randomAvatar && (
            <div className={styles.avatarContainer}>
              <img
                src={randomAvatar}
                alt="头像"
                className={styles.avatarImage}
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <Input
              value={name}
              onChange={(val) => setName(val)}
              placeholder="请输入名称"
              maxLength={20}
              clearable
              className={styles.entryInput}
            />
          </div>

          <Button
            color="primary"
            size="large"
            block
            onClick={handleSubmit}
            className={styles.submitButton}
          >
            确定
          </Button>

          {/* 清空数据按钮（用于测试） */}
          <Button
            size="small"
            block
            onClick={handleClearData}
            className={styles.clearDataButton}
            style={{ marginTop: "10px", fontSize: "12px" }}
          >
            清空数据（测试用）
          </Button>
        </div>
      </div>
    </div>
  );
}
