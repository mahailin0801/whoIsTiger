// 背景图数组
export const backgroundImages = [
  "https://osstest.jrdaimao.com/file/1764049483491953.png",
  "https://osstest.jrdaimao.com/file/1764049147144183.png",
];

// 头像图片数组
export const avatarImages = [
  "https://osstest.jrdaimao.com/file/1764049174698844.png",
  "https://osstest.jrdaimao.com/file/1764049189329846.png",
  "https://osstest.jrdaimao.com/file/1764049201408275.png",
  "https://osstest.jrdaimao.com/file/1764049216082337.png",
  "https://osstest.jrdaimao.com/file/1764049227012566.png",
  "https://osstest.jrdaimao.com/file/1764049236364123.png",
  "https://osstest.jrdaimao.com/file/1764049247586963.png",
  "https://osstest.jrdaimao.com/file/1764049256058206.png",
  "https://osstest.jrdaimao.com/file/1764049265270700.png",
];

// 主持人固定ID
export const HOST_ID = "host-mahailin888";
export const HOST_NAME = "mahailin888";

// 生成唯一ID（基于时间戳 + 随机数）
export function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

