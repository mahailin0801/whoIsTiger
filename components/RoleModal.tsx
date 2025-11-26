"use client";

import { Button } from "antd-mobile";
import styles from "./RoleModal.module.scss";

interface RoleModalProps {
  role: "civilian" | "undercover" | "blank" | null;
  visible: boolean;
  onConfirm: () => void;
  civilianWord?: string;
  undercoverWord?: string;
}

export default function RoleModal({
  role,
  visible,
  onConfirm,
  civilianWord,
  undercoverWord,
}: RoleModalProps) {
  const getRoleText = (role: string | null) => {
    if (role === "civilian") return "平民";
    if (role === "undercover") return "卧底";
    if (role === "blank") return "空白";
    return "";
  };

  const getRoleColor = (role: string | null) => {
    if (role === "civilian") return "#52c41a";
    if (role === "undercover") return "#ff4d4f";
    if (role === "blank") return "#faad14";
    return "#666";
  };

  const getRoleWord = (role: string | null) => {
    if (role === "civilian") return civilianWord || "";
    if (role === "undercover") return undercoverWord || "";
    if (role === "blank") return "空白";
    return "";
  };

  const roleText = getRoleText(role);
  const roleColor = getRoleColor(role);
  const roleWord = getRoleWord(role);

  if (!visible || !role) return null;

  return (
    <div className={styles.roleModalOverlay} onClick={onConfirm}>
      <div
        className={styles.roleModalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.roleModalContent}>
          <div className={styles.roleModalTitle}>
            <span className={styles.roleModalTitleText}>你的身份</span>
            <span className={styles.roleModalRole} style={{ color: roleColor }}>
              {roleText}
            </span>
          </div>

          <div
            className={styles.roleModalWord}
            style={{
              background:
                role === "civilian"
                  ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                  : role === "undercover"
                  ? "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
                  : "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
            }}
          >
            {roleWord}
          </div>
          <Button
            color="primary"
            size="large"
            block
            onClick={onConfirm}
            className={styles.roleModalButton}
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  );
}
